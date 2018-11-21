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
      if (err.code === 'ResourceNotFoundException') {
        console.log(`Function ${lambdaFunction} doesn't exists`);
      } else {
        console.log('[Error] => Deleting lambda function', err);
      }
    }
  } else {
    console.log('No lambda functions to delete');
  }
}

module.exports = main;