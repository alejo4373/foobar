const lambda = new AWS.Lambda()

const deleteFunction = (functionName) => {
  return new Promise((resolve, reject) => {
    let params = { FunctionName: functionName };
    lambda.deleteFunction(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async ({ lambdaFunction }) => {
  if (lambdaFunction) {
    try {
      await deleteFunction(lambdaFunction);
      console.log('Removing function:', lambdaFunction);
    } catch (err) {
      console.log('[Error] => Deleting lambda function.');
      if (err.code === 'ResourceNotFoundException') {
        console.log(err.message);
      } else {
        console.log(err);
      }
    }
  } else {
    console.log('No lambda functions to delete');
  }
}

module.exports = main;