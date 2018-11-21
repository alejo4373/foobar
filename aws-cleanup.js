// Load .env file
require('dotenv').config();
const fs = require('fs');

// Put AWS in the global scope
AWS = require('aws-sdk');

// Set APIs versions
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  cognitoidentityserviceprovider: '2016-04-18',
  cognitoidentity: '2014-06-30',
  iam: '2010-05-08',
  appsync: '2017-07-25',
};

// Loads credentials and region
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const cleanupDynamoDB = require('./AWS/cleanup-scripts/dynamoDB.js')

const awsResourcesCreated = JSON.parse(
  fs.readFileSync(
    './awsResourcesCreated.json',
    'utf8'
  )
)

const main = async () => {
  try {
    cleanupDynamoDB(awsResourcesCreated);
  } catch (err) {
    console.log('[Error]:', err);
  }
}

main();