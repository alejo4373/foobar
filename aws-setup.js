// Attach AWS to global object
global.AWS = require('aws-sdk');

const { AWS } = global;

// Set APIs versions
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  cognitoidentityserviceprovider: '2016-04-18',
  cognitoidentity: '2014-06-30',
  iam: '2010-05-08',
};

// Loads credentials and region
AWS.config.loadFromPath('./aws-config.json');

const setupDynamoDB = require('./AWS/setup-scripts/dynamoDB')
const setupCognito = require('./AWS/setup-scripts/cognito')

const main = () => {
  // setupDynamoDB();
  setupCognito();
}

main();