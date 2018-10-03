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
      console.log('Started schema creation')
      resolve(data)
    })
  })
}

const main = async () => {
  let api = null;

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

  //Read the GraphQL schema.
  let schema = fs.readFileSync(path.join(__dirname, '../AppSync/schema.graphql'));
  let schemaParams = {
    apiId: api.apiId,
    definition: schema
  }
  let schemaData = await startSchemaCreation(schemaParams);
  console.log('schemaData', schemaData)
}

module.exports = main;