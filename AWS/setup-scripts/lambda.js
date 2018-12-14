const fs = require('fs');
const path = require('path');
const { createExecutionRoleForLambdaFunction } = require('./iam');
const { setGlobalVar, addFunctionToCreated } = require('../../utils');

const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

const createFunction = (params) => {
  return new Promise((resolve, reject) => {
    lambda.createFunction(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const listFunctions = () => {
  return new Promise((resolve, reject) => {
    lambda.listFunctions({}, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.Functions)
      }
    })
  })
}

const createEventSourceMapping = (params) => lambda.createEventSourceMapping(params).promise();

// Due to IAM roles and policies not being replicated immediately 
// the Lambda function creation might fail because the role is not
// ready. 
// tryCreateFunction tries createFunction() and if failed due to the
// the reason stated above, it will retry as many times as retries (3 in average);
const tryCreateFunction = (operation, retries) => {
  return new Promise(async (resolve, reject) => {
    if (retries > 0) {
      try {
        let success = await operation();
        resolve(success);
      } catch (err) {
        if (
          err.code === 'InvalidParameterValueException' &&
          err.message === 'The role defined for the function cannot be assumed by Lambda.'
        ) {
          console.log('Role not ready to be assumed. Retrying...');
          setTimeout(() => {
            resolve(tryCreateFunction(operation, retries - 1));
          }, 4000);
        } else {
          reject(err);
        }
      }
    } else {
      reject(new Error('Retries exhausted'));
    }
  })
}

/**
 * Creates function that will be used as GraphQL resolver to retrieve 
 * a google photo reference that will serve to retrieve an actual 
 * photo for the establishment.
 */
const createGetGooglePhotoReferenceFunction = async () => {
  let functionZipFile = fs.readFileSync(path.join(__dirname, '../Lambda/getGooglePhotoReference.zip'))
  let roleArn = await createExecutionRoleForLambdaFunction();
  let funcParams = {
    FunctionName: 'getGooglePhotoReference',
    Runtime: 'nodejs8.10',
    Role: roleArn,
    Handler: 'getGooglePhotoReference.handler',
    Description: 'Function to get a google place photo reference that the client can use to request a photo for a given establishment',
    Environment: {
      Variables: {
        "GOOGLE_MAPS_API_KEY": process.env['GOOGLE_MAPS_API_KEY']
      }
    },
    Code: {
      ZipFile: functionZipFile
    }
  }
  return deployFunction(funcParams);
}

/**
 * Attempts to create a function and reties 4 times in case of failure,
 * with the received params if another function with the same name
 * doesn't already exists. It also exports the name of the function to 
 * global.aws_vars.created, as well as to global.aws_vars
 * @param {Object} funcParams 
 */
const deployFunction = async (funcParams) => {
  let func;
  let functions;

  try {
    functions = await listFunctions();
    func = functions.find(f => f.FunctionName === funcParams.FunctionName);
    if (func) {
      console.log(`Function with name ${func.FunctionName} already exists. Skipping...`)
    } else {
      try {
        // Try to create function and retry a max of 4 times 
        func = await tryCreateFunction(() => createFunction(funcParams), 4);
        console.log(`Function "${func.FunctionName}" created. Success...`)
      } catch (err) {
        console.log('[Error]', err)
      }
    }
  } catch (err) {
    console.log('[Error]', err)
  }

  if (func) {
    //Make available the function arn as a global variable with the function name
    setGlobalVar(func.FunctionName, func.FunctionArn);
    addFunctionToCreated(func.FunctionName);
    return func.FunctionArn;
  } else {
    return false
  }
}

module.exports = {
  createGetGooglePhotoReferenceFunction,
  createEventSourceMapping,
  deployFunction
};
