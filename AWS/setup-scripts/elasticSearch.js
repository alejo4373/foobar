const fs = require('fs');
const path = require('path');
const iam = require('../setup-scripts/iam');
const lambda = require('../setup-scripts/lambda');

// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })
const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const isDomainReady = (domainName) => {
  console.log('Checking if ES domain is ready. Please wait.');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      ES.describeElasticsearchDomain({ DomainName: domainName }, (err, data) => {
        if (err) { reject(err) }
        else {
          if (data.DomainStatus.Processing === false) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    }, 1000 * 60 * 2);
  });
}

// Ask if domain is ready every 2 minutes
const waitUntilDomainReady = async (domainName) => {
  console.log(`Waiting for domain ${domainName} to be ready...`);
  console.log('[Note] New domains take up to ten minutes to initialize. After your domain is initialized, you can upload data and make changes to the domain.');
  let domainReady = false;
  while (!domainReady) {
    try {
      domainReady = await isDomainReady(domainName);
    } catch (err) {
      return console.log('[Error]', err);
    }
  }
  console.log('Domain is ready for use in production');
}

/**
 * Create Elasticsearch domain with access policy that allows
 * access to the roleArn to interact with the domain
 * @param {string} domainName The domain name to be used
 * @param {string} roleArn Role ARN that will have access to domain
 **/
const createESDomain = async (domainName, roleArn) => {
  const domainAccessPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": roleArn
        },
        "Action": "es:*",
        "Resource": `arn:aws:es:${AWS.config.region}:*:domain/${domainName}/*`
      }
    ]
  }
  const esDomainParams = {
    DomainName: domainName,
    AccessPolicies: JSON.stringify(domainAccessPolicy),
    EBSOptions: {
      EBSEnabled: true,
      VolumeSize: 10,
      VolumeType: 'gp2'
    },
    ElasticsearchClusterConfig: {
      InstanceCount: 1,
      InstanceType: "t2.small.elasticsearch",
      DedicatedMasterEnabled: false,
      ZoneAwarenessEnabled: false
    },
    ElasticsearchVersion: '6.3',
    EncryptionAtRestOptions: {
      Enabled: false,
    },
    NodeToNodeEncryptionOptions: {
      Enabled: false
    },
    SnapshotOptions: {
      AutomatedSnapshotStartHour: 0
    },
  };
  try {
    console.log('Creating ES domain');
    let { DomainStatus } = await ES.createElasticsearchDomain(esDomainParams).promise();

    // If processing is not true, it means the domain was already created
    // aws doesn't complain if trying to create a domain with the name of
    // an already existing domain
    if (DomainStatus.Processing === true) {
      console.log('New ES domain created. Success');
      await waitUntilDomainReady(domainName);
    } else {
      console.log(`Domain '${domainName}' already exists. Skipping...`)
    }
    return DomainStatus;
  } catch (err) {
    throw err;
  }
}

/**
 * Creates function that will read items from a DynamoDB table stream
 * and index them as documents to the Elasticsearch domain
 * @param {string} name Function name
 * @param {string} zipFilePath File system path to function dev package .zip
 * @param {string} tableName Table to read stream from
 * @param {string} esDomainEndpoint Domain to which index documents
 */
const createAndSetupESIndexerFunction = async (name, zipFilePath, tableName, esDomainEndpoint) => {
  try {
    let functionZipFile = fs.readFileSync(path.join(__dirname, zipFilePath))
    let roleArn = await iam.createRoleForLambdaToAccessES();
    let funcParams = {
      FunctionName: name, Runtime: 'nodejs8.10',
      Role: roleArn,
      Handler: `${name}.handler`,
      Description: 'Function to read DynamoDB table stream and index items as documents in ES domain',
      Environment: {
        Variables: {
          "ES_DOMAIN_ENDPOINT": esDomainEndpoint
        }
      },
      Code: {
        ZipFile: functionZipFile
      }
    }
    let functionArn = await lambda.deployFunction(funcParams);
    await setupTriggerForFunction(tableName, functionArn);
  } catch (err) {
    throw err;
  }

}

/**
 * Setup trigger that will fire the function i.e events being written to
 * the stream of the given table 
 * @param {string} tableName Table source of the stream 
 * @param {string} functionArn Function to fire on events in the stream
 */
const setupTriggerForFunction = async (tableName, functionArn) => {
  try {
    let { Table } = await DDB.describeTable({ TableName: tableName }).promise();
    let eventSourceArn = Table.LatestStreamArn;
    await lambda.createEventSourceMapping({
      EventSourceArn: eventSourceArn,
      FunctionName: functionArn,
      StartingPosition: 'LATEST',
      Enabled: true
    });
    console.log(`Trigger for function '${functionArn.split(':')[6]}' reading '${tableName}' table stream created. Success`);
  } catch (err) {
    if (err.code === 'ResourceConflictException') {
      console.log(`[WARNING] Trigger for function '${functionArn.split(':')[6]}' already exists. Skipping...`);
    } else {
      console.log('[Error] ==>', err);
    }
  }
}

const main = async () => {
  let domainName = 'foobar-es-domain';
  let accessRoleArn;
  let domain;
  try {
    accessRoleArn = await iam.createRoleForLambdaToAccessES();
    domain = await createESDomain(domainName, accessRoleArn);
    createAndSetupESIndexerFunction(
      'foobar_establishments_DDB_ES_indexer',
      '../Lambda/foobar_lambda_DDB_ES_indexers/foobar_establishments_DDB_ES_indexer.zip',
      'foobar_establishments_table',
      domain.Endpoint
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = main;
