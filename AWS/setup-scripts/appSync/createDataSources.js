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

/**
 * Creates a data source or retrieves it if already exists and returns it
 * @param {string} apiId API for which to create the data source
 * @param {object} dataSourceParams Object with data-source relevant info
 * @param {string} dataSourceParams.type Data-source type "AMAZON_DYNAMODB" || "AMAZON_ELASTICSEARCH" || "AWS_LAMBDA"
 * @param {object} dataSourceParams.dataSource Object with name, arn and/or endPoint properties
 */
const setUpDataSource = async (apiId, { type, dataSource }) => {
  let dataSourceCreated;
  try {
    dataSourceCreated = await getDataSource(apiId, dataSource.name);
  } catch (err) {
    if (err.code === 'NotFoundException') {
      dataSourceCreated = null;
    } else {
      console.log('[Error]', err)
    }
  }

  if (!dataSourceCreated) {
    let params = {
      apiId,
      type,
      name: dataSource.name,
      serviceRoleArn: null // Will be set once the role is created
    };

    switch (type) {
      case 'AWS_LAMBDA':
        params.lambdaConfig = {
          lambdaFunctionArn: dataSource.arn
        }
        try {
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('lambdaFunction', dataSource.name, dataSource.arn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;

      case 'AMAZON_DYNAMODB':
        params.dynamodbConfig = {
          awsRegion: AWS.config.region,
          tableName: dataSource.name,
          useCallerCredentials: false
        }
        // Create the appropriate role to allow access to data source.
        try {
          params.serviceRoleArn = await iam.createRoleForAppSyncToAccessDataSource('dynamoDBTable', dataSource.name, dataSource.arn)
        } catch (err) {
          console.log('[Error]', err)
        }
        break;

      case 'AMAZON_ELASTICSEARCH':
        params.serviceRoleArn = await iam.createRoleToAccessES();
        params.elasticsearchConfig = {
          awsRegion: AWS.config.region,
          endpoint: 'https://' + dataSource.endPoint
        }
    }

    try {
      dataSourceCreated = await createDataSource(params);
      console.log(`Data source with name: ${dataSource.name} created. Success`)
    } catch (err) {
      console.log('[Error]', err)
    }
  } else {
    console.log(`Data source with name: ${dataSource.name} already exists. Skipping `)
  }

  return dataSourceCreated;
}

/**
 * Creates and sets up data-sources 
 * @param {string} apiId API for which to create the data sources
 * @returns Array with all the created data-sources names
 */
const main = async (apiId) => {
  let establishmentTableDsParams = {
    type: 'AMAZON_DYNAMODB',
    dataSource: dataSourceManager.get('AMAZON_DYNAMODB', 'foobar_establishments_table')
  }

  let eventsTableDsParams = {
    type: 'AMAZON_DYNAMODB',
    dataSource: dataSourceManager.get('AMAZON_DYNAMODB', 'foobar_events_table')
  }

  let lambdaFunctionDsParams = {
    type: 'AWS_LAMBDA',
    dataSource: dataSourceManager.get('AWS_LAMBDA', 'getGooglePhotoReference')
  }

  let esDomainDSParams = {
    type: 'AMAZON_ELASTICSEARCH',
    dataSource: {
      name: 'ESDomain',
      endPoint: dataSourceManager.get('AMAZON_ELASTICSEARCH', 'domain').endPoint
    }
  }

  // The following statements could happen asynchronously but due to confusing log messages I decided against it.
  let establishmentTableDs = await setUpDataSource(apiId, establishmentTableDsParams)
  let eventsTableDs = await setUpDataSource(apiId, eventsTableDsParams)
  let lambdaFunctionDs = await setUpDataSource(apiId, lambdaFunctionDsParams)
  let esDomainDS = await setUpDataSource(apiId, esDomainDSParams)
  let dataSources = [establishmentTableDs.name, eventsTableDs.name, lambdaFunctionDs.name, esDomainDS.name];
  return dataSources;
}

module.exports = main
