const appSync = new AWS.AppSync();
const iam = require('../iam')
const { dataSourceManager } = require('./../../../utils');

const createDataSource = (params) => {
  return new Promise((resolve, reject) => {
    appSync.createDataSource(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.dataSource) }
    })
  })
}

const getDataSource = (apiId, name) => {
  const params = { apiId, name }
  return new Promise((resolve, reject) => {
    appSync.getDataSource(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.dataSource) }
    })
  })
}

// Creates a data source or retrieves it if already exists and returns it
const main = async ({ type, apiId, dataSourceName }) => {
  // See if a data source already exists. If not create it, otherwise skip
  let dataSource;
  try {
    dataSource = await getDataSource(apiId, dataSourceName);
  } catch (err) {
    if (err.code === 'NotFoundException') {
      dataSource = null;
    } else {
      console.log('[Error]', err)
    }
  }

  if (!dataSource) {
    let params = {
      apiId,
      type,
      name: dataSourceName,
      serviceRoleArn: null // Will be set once the role is created
    };

    switch (type) {
      case 'AWS_LAMBDA':
        let dataSourceArn = dataSourceManager.get(type, dataSourceName).arn
        params.lambdaConfig = {
          lambdaFunctionArn: dataSourceArn
        }
        try {
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('lambdaFunction', dataSourceName, dataSourceArn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;

      case 'AMAZON_DYNAMODB':
        params.dynamodbConfig = {
          awsRegion: AWS.config.region,
          tableName: dataSourceName,
          useCallerCredentials: false
        }
        // Create the appropriate role to allow access to data source.
        try {
          let dataSourceArn = dataSourceManager.get(type, dataSourceName).arn
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('dynamoDBTable', dataSourceName, dataSourceArn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;

      case 'AMAZON_ELASTICSEARCH':
        params.serviceRoleArn = await iam.createRoleToAccessES();
        params.elasticsearchConfig = {
          awsRegion: AWS.config.region,
          endpoint: 'https://' + dataSourceManager.get(type, 'domain').endPoint
        }
    }

    try {
      dataSource = await createDataSource(params);
      console.log(`Data source with name: ${dataSource.name} created. Success`)
    } catch (err) {
      console.log('[Error]', err)
    }
  } else {
    console.log(`Data source with name: ${dataSource.name} already exists. Skipping `)
  }

  return dataSource;
}
module.exports = main
