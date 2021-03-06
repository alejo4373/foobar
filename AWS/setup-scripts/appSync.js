const fs = require('fs');
const path = require('path');
const appSync = new AWS.AppSync();

const { setGlobalVar, addToCreatedInGlobalVar } = require('../../utils');
const createDataSources = require('./appSync/createDataSources');
const createResolvers = require('./appSync/createResolvers');
const { envPrefix } = global;

const listApis = () => {
  return new Promise((resolve, reject) => {
    appSync.listGraphqlApis({}, (err, data) => {
      if (err) { reject(err) }
      resolve(data.graphqlApis)
    })
  })
}

const createApi = (params) => {
  return new Promise((resolve, reject) => {
    appSync.createGraphqlApi(params, (err, data) => {
      if (err) { reject(err) }
      resolve(data.graphqlApi)
    })
  })
}

const startSchemaCreation = (params) => {
  return new Promise((resolve, reject) => {
    appSync.startSchemaCreation(params, (err, data) => {
      if (err) { reject(err) }
      console.log('Uploading schema')
      resolve(data)
    })
  })
}

// Will ask if the schema is ready once every second and return a promise
const isSchemaReady = (apiId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      appSync.getSchemaCreationStatus({ apiId: apiId }, (err, data) => {
        if (err) { reject(err) }
        else {
          if (data.status === 'SUCCESS') {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      })
    }, 3000)
  })
}

const waitUntilSchemaIsReady = async (apiId) => {
  let schemaReady = false;

  while (!schemaReady) {
    console.log('Waiting until schema is ready...')
    try {
      // Wait for the promise to resolve (1 second), blocking event loop before moving to next iteration.
      schemaReady = await isSchemaReady(apiId);
    } catch (err) {
      return console.log('[Error]', err);
    }
  }
  return schemaReady;
}

const main = async () => {
  let apiParams = {
    authenticationType: 'AWS_IAM',
    name: `${envPrefix}Foobar API`,
  }

  let apis;
  let api;

  try {
    apis = await listApis();
    api = apis.find(crrApi => crrApi.name === apiParams.name);
    if (api) {
      console.log('Create GraphQL Api: Skipping, because another api with same name already exists')
    } else {
      try {
        api = await createApi(apiParams);
        console.log('Create GraphQL Api: Success')
      } catch (err) {
        console.log('[Error]', err)
      }
    }
  } catch (err) {
    console.log('[Error]', err);
  }

  console.log('==> Api Name:', api.name)
  console.log('==> Api Id:', api.apiId)
  setGlobalVar('api', {
    id: api.apiId,
    GRAPHQL_ENDPOINT: api.uris.GRAPHQL
  });
  addToCreatedInGlobalVar("graphqlApiId", api.apiId);

  //Read the local file GraphQL schema.
  let schemaDefinition = fs.readFileSync(path.join(__dirname, '../AppSync/schema.graphql'));

  let schemaParams = {
    apiId: api.apiId,
    definition: schemaDefinition
  }

  let schemaReady;

  try {
    await startSchemaCreation(schemaParams);

    // Halt event loop until the schema is ready, since all following steps depend on this one
    schemaReady = await waitUntilSchemaIsReady(api.apiId);

  } catch (err) {
    console.log('[Error]', err)
  }
  console.log('Schema is ready?:', schemaReady);

  // Set up data-sources
  let dataSources = await createDataSources(api.apiId)
  // Set up resolvers
  createResolvers(api.apiId, dataSources);
}

module.exports = main;
