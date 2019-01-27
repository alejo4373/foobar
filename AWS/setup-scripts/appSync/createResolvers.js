const fs = require('fs');
const path = require('path');

const appSync = new AWS.AppSync();

const dataSourcesFieldsTypesResolversMap = require('../../AppSync/Resolvers/dataSourcesFieldsTypesResolversMap.js');

const createResolver = (params) => {
  return new Promise((resolve, reject) => {
    appSync.createResolver(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.resolver) }
    })
  })
}

const getResolver = (apiId, fieldName, typeName) => {
  return new Promise((resolve, reject) => {
    appSync.getResolver({ apiId, fieldName, typeName }, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.resolver) }
    })
  })
}

const setupResolver = async (apiId, fieldName, typeName, dataSourceName) => {
  let resolver;
  try {
    resolver = await getResolver(apiId, fieldName, typeName);
    console.log(`Resolver for field ${resolver.fieldName} already exists. Skipping...`);
  } catch (err) {
    // If resolver doesn't exists yet then create it
    if (err.code === 'NotFoundException') {
      // Read request and response mapping templates that match field name filename
      let requestMappingTemplate = fs.readFileSync(path.resolve(
        __dirname, `../../AppSync/Resolvers/${fieldName}_RequestMap.vtl`
      ), 'utf8');
      let responseMappingTemplate = fs.readFileSync(path.resolve(
        __dirname, `../../AppSync/Resolvers/${fieldName}_ResponseMap.vtl`
      ), 'utf8');

      let newResolverParams = {
        apiId,
        fieldName,
        typeName,
        dataSourceName,
        requestMappingTemplate,
        responseMappingTemplate,
      };

      try {
        resolver = await createResolver(newResolverParams);
        console.log(`Resolver for field ${resolver.fieldName} created. Success!`);
      } catch (err) {
        console.log('[Error]:', err);
      }
    } else {
      console.log('[Error]:', err);
    }
  }
}

const main = async (apiId, dataSources) => {
  let promises = [];

  // For each data source in dataSourcesFieldsTypesResolversMap
  // set up the resolvers for each type and for each field
  dataSources.forEach(dataSource => {
    let crrDataSource = dataSourcesFieldsTypesResolversMap[dataSource];
    let types = Object.keys(crrDataSource);
    types.forEach(type => {
      let fields = crrDataSource[type];
      fields.forEach(field => {
        promises.push(setupResolver(apiId, field, type, dataSource));
      })
    })
  })

  let res;
  try {
    res = await Promise.all(promises);
  } catch (err) {
    console.log('[Error]:', err);
  }
}
module.exports = main;
