const fs = require('fs');
const path = require('path');
const { createExecutionRoleForLambdaFunction } = require('./iam');

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

const main = async () => {
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

  let func;
  let functions;

  try {
    functions = await listFunctions();
    func = functions.find(f => f.FunctionName === funcParams.FunctionName);
    if (func) {
      console.log(`Function with name ${func.FunctionName} already exists. Skipping...`)
    } else {
      try {
        func = await createFunction(funcParams);
        console.log(`New function ${func.FunctionName} created. Success`)
      } catch (err) {
        console.log('[Error]', err)
      }
    }
  } catch (err) {
    console.log('[Error]', err)
  }

  if (func) {
    return func.FunctionArn;
  } else {
    return false
  }
}

module.exports = main;