const cognitoIDP = new AWS.CognitoIdentityServiceProvider();
const cognitoIdentity = new AWS.CognitoIdentity();

const deleteUserPool = (userPoolId) => {
  return new Promise((resolve, reject) => {
    let params = { UserPoolId: userPoolId };
    cognitoIDP.deleteUserPool(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const deleteIdentityPool = (identityPoolId) => {
  return new Promise((resolve, reject) => {
    let params = { IdentityPoolId: identityPoolId };
    cognitoIdentity.deleteIdentityPool(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async ({ userPool, identityPool }) => {
  if (identityPool) {
    try {
      await deleteIdentityPool(identityPool.id);
      console.log(`Removing identity pool with name: ${identityPool.name}, id: ${identityPool.id}`);
    } catch (err) {
      if (err.code === 'ResourceNotFoundException') {
        console.log(`Identity pool ${identityPool.name} doesn't exists`);
      } else {
        console.log('[Error] => Deleting Identity pool', err);
      }
    }
  } else {
    console.log('No Identity pool to delete');
  }

  if (userPool) {
    try {
      await deleteUserPool(userPool.id);
      console.log(`Removing user pool with name: ${userPool.name}, id: ${userPool.id}`);
    } catch (err) {
      if (err.code === 'ResourceNotFoundException') {
        console.log(`User pool ${userPool.name} doesn't exists`);
      } else {
        console.log('[Error] => Deleting User pool', err);
      }
    }
  } else {
    console.log('No User pool to delete');
  }
}

module.exports = main;