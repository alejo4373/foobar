const fs = require('fs');
const path = require('path');
const iam = require('../setup-scripts/iam');
const lambda = require('../setup-scripts/lambda');
const utils = require('../../utils');

// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })
const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const { envPrefix } = global;

const isDomainReady = (domainName) => {
  console.log('Initializing ES domain. Please wait.');
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
  console.log('[Note] New domains take up to 10 minutes to initialize. An uninitialized domain cannot perform queries or index documents.');
  let domainReady = false;
  while (!domainReady) {
    try {
      domainReady = await isDomainReady(domainName);
    } catch (err) {
      return console.log('[Error]', err);
    }
  }
  console.log('==== Domain fully initialized. Ready for use. ====');
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
    utils.addToCreatedInGlobalVar('esDomain', DomainStatus.DomainName);
    utils.dataSourceManager.add('AMAZON_ELASTICSEARCH', {
      name: DomainStatus.DomainName,
      arn: DomainStatus.ARN,
      endPoint: DomainStatus.Endpoint
    });
    return DomainStatus;
  } catch (err) {
    throw err;
  }
}

/**
 * Tries to create an ElasticSearch Domain. If failed due to the role
 * used in the domain access policy not being ready it will retry
 * every 5 seconds until retries are exhausted
 * @param {string} domainName Name for the new domain to be created
 * @param {string} roleArn Role that will have access to the domain
 * @param {number} retries Number of attempts to create the domain
 */
const tryCreateESDomain = (domainName, roleArn, retries) => {
  return new Promise(async (resolve, reject) => {
    if (retries > 0) {
      try {
        let success = await createESDomain(domainName, roleArn);
        resolve(success);
      } catch (err) {
        if (err.code === 'InvalidTypeException' && err.message.includes('Error setting policy')) {
          console.log('Role to be used in ES Domain access policy not ready yet. Retrying...');
          setTimeout(() => {
            resolve(tryCreateESDomain(domainName, roleArn, retries - 1));
          }, 5000);
        } else {
          reject(err)
        }
      }
    } else {
      reject(new Error('tryCreateESDomain() retries exhausted'));
    }
  })
}

/**
 * Creates function that will read items from a DynamoDB table stream
 * and index them as documents to the Elasticsearch domain.
 * Since the Role & Policy used for this is bilateral, that is, it sets
 * the access policy in the domain (who and what can access the domain)
 * it is the perfect role for the Lambda function and therefore passed
 * here as roleArn.
 * @param {string} name Function name
 * @param {string} tableName Table to read stream from
 * @param {string} esDomainEndpoint Domain to which index documents
 * @param {string} index index that will be used by the function via ENV var
 * @param {string} roleArn role that allows access to ES domain
 **/
const createAndSetupESIndexerFunction = async (name, tableName, esDomainEndpoint, index, roleArn) => {
  try {
    let functionZipFile = fs.readFileSync(path.join(
      __dirname,
      '../Lambda/foobar_DDB_ES_items_indexer.zip',
    ));
    let funcParams = {
      FunctionName: name,
      Runtime: 'nodejs8.10',
      Role: roleArn,
      Handler: 'foobar_DDB_ES_items_indexer.handler',
      Description: 'Function to read DynamoDB table stream and index items as documents in ES domain',
      Environment: {
        Variables: {
          "ES_DOMAIN_ENDPOINT": esDomainEndpoint,
          "ES_INDEX": index
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
  let domainName = `${envPrefix}foobar-es-domain`;
  let accessRoleArn;
  let domain;
  try {
    accessRoleArn = await iam.createRoleToAccessES();
    console.log('==== Creating ES domain ====');
    domain = await tryCreateESDomain(domainName, accessRoleArn, 4);
    console.log('==== Creating Establishment indexer function ====');
    await createAndSetupESIndexerFunction(
      `${envPrefix}foobar_establishments_DDB_ES_indexer`,
      `${envPrefix}foobar_establishments_table`,
      domain.Endpoint,
      'establishments-index',
      accessRoleArn
    );
    console.log('==== Creating Events indexer function ====');
    await createAndSetupESIndexerFunction(
      `${envPrefix}foobar_events_DDB_ES_indexer`,
      `${envPrefix}foobar_events_table`,
      domain.Endpoint,
      'events-index',
      accessRoleArn
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = main;
