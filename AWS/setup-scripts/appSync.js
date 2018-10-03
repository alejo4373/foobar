const fs = require('fs');
const path = require('path');

const { AWS } = global;

const appSync = new AWS.AppSync();

const listApis = () => {
  return new Promise(resolve => {
    appSync.listGraphqlApis({}, (err, data) => {
      if (err) { resolve({ err: err }) }
      resolve(data.graphqlApis)
    })
  })
}

const createApi = (params) => {
  return new Promise(resolve => {
    appSync.createGraphqlApi(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      console.log('Created GraphQL Api')
      resolve(data)
    })
  })
}

const startSchemaCreation = (params) => {
  return new Promise(resolve => {
    appSync.startSchemaCreation(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      console.log('Uploading schema')
      resolve(data)
    })
  })
}

// Will ask if the schema is ready once every second and return promise
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
    }, 1000)
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
  let api = null;
  let schemaReady = false;

  let apiParams = {
    authenticationType: 'AWS_IAM',
    name: 'foobar_api',
  }

  const apis = await listApis();
  if (apis.err) { console.log('[Error]', apis.err) }
  const apiAlreadyExists = apis.find(api => api.name === apiParams.name);
  if (apiAlreadyExists) {
    api = apiAlreadyExists;
    console.log('Create GraphQL Api: Skipping, because another api with same name already exists')
  } else {
    api = await createApi(apiParams);
    if (api.err) { console.log('[Error]', api.err) }
  }

  console.log('==> Api Name:', api.name)
  console.log('==> Api Id:', api.apiId)

  //Read the local GraphQL schema.
  let schemaDefinition = fs.readFileSync(path.join(__dirname, '../AppSync/schema.graphql'));

  let schemaParams = {
    apiId: api.apiId,
    definition: schemaDefinition
  }

  let schemaData = await startSchemaCreation(schemaParams);
  if (schemaData.err) { console.log('[Error]', schemaData.err) }
  else {
    // Halt event loop until the schema is ready, since all following steps depend on this one
    schemaReady = await waitUntilSchemaIsReady(api.apiId);
  }
  console.log('Schema is ready?:', schemaReady);

  //TODO Add Data sources


}

module.exports = main;