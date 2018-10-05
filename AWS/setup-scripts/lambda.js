const fs = require('fs');
const path = require('path');

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

const main = async () => {
  let functionZipFile = fs.readFileSync(path.join(__dirname, '../Lambda/getGooglePhotoReference.zip'))

  let funcParams = {
    FunctionName: 'getGooglePhotoReference1',
    Runtime: 'nodejs8.10',
    //TODO: create new lambda execution role right before creating the function
    Role: 'arn:aws:iam::919273051626:role/lambda_basic_execution',
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
  try {
    func = await createFunction(funcParams);
  } catch (err) {
    console.log('[Error]', err)
  }

  console.log('fun', func);
}

module.exports = main;