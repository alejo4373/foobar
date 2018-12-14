const lambda = new AWS.Lambda()

const deleteFunction = async (functionName) => {
  try {
    const params = { FunctionName: functionName };
    const { EventSourceMappings } = await lambda.listEventSourceMappings(params).promise();
    // Remove all event source mappings (triggers) for the current function
    for (let i = 0; i < EventSourceMappings.length; i++) {
      const { UUID } = EventSourceMappings[i];
      await lambda.deleteEventSourceMapping({ UUID: UUID }).promise();
       console.log(`=> Deleted event source mapping (i.e trigger) UUID: '${UUID}' for function`);
    }
    return await lambda.deleteFunction(params).promise();
  } catch (err) {
    throw err;
  }
}

const main = async ({ lambdaFunctions }) => {
  if (lambdaFunctions.length) {
    try {
      for (let i = 0; i < lambdaFunctions.length; i++) {
        let f = lambdaFunctions[i];
        console.log('Deleting function:', f);
        await deleteFunction(f);
      }
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
