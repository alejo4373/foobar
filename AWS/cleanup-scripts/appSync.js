const appsync = new AWS.AppSync()

const deleteApi = (apiId) => {
  return new Promise((resolve, reject) => {
    let params = { apiId };
    appsync.deleteGraphqlApi(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async ({ graphqlApiId }) => {
  if (graphqlApiId) {
    try {
      await deleteApi(graphqlApiId);
      console.log('Deleting GraphQL API with ID:', graphqlApiId);
    } catch (err) {
      if (err.code === 'NotFoundException') {
        console.log(`GraphQl API with ID ${graphqlApiId} doesn't exists`);
      } else {
        console.log('[Error] => Deleting GraphQL API', err);
      }
    }
  } else {
    console.log('No GraphQL API to delete');
  }
}

module.exports = main;