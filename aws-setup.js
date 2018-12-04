// Load AWS credentials from Environment Variables
require('dotenv').config();

// Attach AWS to global object
global.AWS = require('aws-sdk');

// Will hold runtime variables like ARNs to connect services
global.aws_vars = {
  created: {} // Will hold AWS resources created to be exported as awsResourcesCreated.json
};

const { AWS } = global;
const { exportEnvVarsFile, exportCreatedResourcesAsJson } = require('./utils');

// Set APIs versions
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  cognitoidentityserviceprovider: '2016-04-18',
  cognitoidentity: '2014-06-30',
  iam: '2010-05-08',
  appsync: '2017-07-25',
};

const setupDynamoDB = require('./AWS/setup-scripts/dynamoDB');
const setupCognito = require('./AWS/setup-scripts/cognito');
const setupAppSync = require('./AWS/setup-scripts/appSync');
const setupLambda = require('./AWS/setup-scripts/lambda');
const generateSampleData = require('./generateSampleData');

const main = async () => {
  try {
    await setupDynamoDB();
    await setupLambda();
    await setupAppSync();
    await setupCognito();
    exportEnvVarsFile(); // Will output ./react-app/.env file for use when launching the React App
    exportCreatedResourcesAsJson(); // Will output awsResourcesCreate.json for use when cleaning up (aws-cleanup.js)
    generateSampleData();
  } catch (err) {
    console.log("[Error]:", err);
  }
}

main();