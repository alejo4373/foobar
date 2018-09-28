// Attach AWS to global object
global.AWS = require('aws-sdk');

const { AWS } = global;

// Set APIs versions
AWS.config.apiVersions = {
  cognitoidentity: '2014-06-30',
  dynamodb: '2012-08-10',
};

// Loads credentials and region
AWS.config.loadFromPath('./aws-config.json');

const setupDynamoDB = require('./AWS/setup-scripts/dynamoDB')

const main = () => {
  setupDynamoDB();
}

main();