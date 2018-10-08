const appSync = new AWS.AppSync();

const createDataSource = (params) => {
  return new Promise((resolve, reject) => {
    appSync.createDataSource(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}

const main = async ({ name, apiId, type, typeConfig, serviceRoleArn }) => {
  let params = {
    apiId,
    name,
    type,
    serviceRoleArn
  };

  switch (type) {
    case 'AWS_LAMBDA':
      params.lambdaConfig = {
        lambdaFunctionArn: typeConfig.lambdaFunctionArn
      }
      break;

    case 'AMAZON_DYNAMODB':
      params.dynamodbConfig = {
        awsRegion: AWS.config.region,
        tableName: typeConfig.tableName,
        useCallerCredentials: true
      }
      break;
  }

  let dataSource;
  try {
    dataSource = await createDataSource(params);
    return dataSource;
  } catch (err) {
    console.log('[Error]', err)
  }
}

module.exports = main