const cognito_idp = new AWS.CognitoIdentityServiceProvider();
const cognito_identity = new AWS.CognitoIdentity();

const deleteUserPool = (userPoolId) => {
  return new Promise((resolve, reject) => {
    let params = { UserPoolId: userPoolId };
    cognito_idp.deleteUserPool(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async ({ userPool, identityPool }) => {
  if (userPool.id) {
    try {
      await deleteUserPool(userPool.id);
      console.log(`Removing user pool with name: ${userPool.name}, id: ${userPool.id}`);
    } catch (err) {
      if (err.code === 'ResourceNotFoundException') {
        console.log(`User pool ${lambdaFunction} doesn't exists`);
      } else {
        console.log('[Error] => Deleting User pool', err);
      }
    }
  } else {
    console.log('No User pool to delete');
  }
}

module.exports = main;