const appSync = new AWS.AppSync();
const iam = require('../iam')

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
const main = async ({ type, apiId, dataSourceName, dataSourceArn }) => {
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
        params.lambdaConfig = {
          lambdaFunctionArn: dataSourceName
        }
        try {
          // TODO create role for lambda
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('lambdaFunction', dataSourceName, dataSourceArn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;

      case 'AMAZON_DYNAMODB':
        params.dynamodbConfig = {
          awsRegion: AWS.config.region,
          tableName: dataSourceName,
          useCallerCredentials: true
        }
        // Create the appropriate role to allow access to data source.
        try {
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('dynamoDBTable', dataSourceName, dataSourceArn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;
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