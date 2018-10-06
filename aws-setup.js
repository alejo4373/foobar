// Load .env file
require('dotenv').config();

// Attach AWS to global object
global.AWS = require('aws-sdk');
global.aws_vars = {}; //Will hold runtime variables like ARNs to connect services

const { AWS } = global;

// Set APIs versions
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  cognitoidentityserviceprovider: '2016-04-18',
  cognitoidentity: '2014-06-30',
  iam: '2010-05-08',
  appsync: '2017-07-25',
};

// Loads credentials and region
AWS.config.loadFromPath('./aws-config.json');

const setupDynamoDB = require('./AWS/setup-scripts/dynamoDB')
const setupCognito = require('./AWS/setup-scripts/cognito')
const setupAppSync = require('./AWS/setup-scripts/appSync');
const setupLambda = require('./AWS/setup-scripts/lambda');

const main = async () => {
  await setupDynamoDB();
  // setupCognito();
  setupAppSync()
  // setupLambda()
}

main();