const fs = require('fs');
const path = require('path');
const ESClient = require('aws-elasticsearch-client');
const iam = require('../setup-scripts/iam');
const lambda = require('../setup-scripts/lambda');
const utils = require('../../utils');

// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })
const DDB = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const { envPrefix } = global;

/**
 * Delay for 2 minutes and check if domain is ready for use 
 * i.e. is no longer processing and it has been assigned an
 * endpoint to interact with it.
 * @param {string} domainName Domain name to check status for 
 * @returns {Promise.<(object|boolean)>} Promise that resolves to 
 * Domain status if domain ready, false otherwise
 */
const isDomainReady = (domainName) => {
  console.log('Initializing ES domain. Please wait.');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      ES.describeElasticsearchDomain({ DomainName: domainName }, (err, data) => {
        if (err) { reject(err) }
        else {
          const { Processing, Endpoint } = data.DomainStatus;
          // Domain is ready when Processing is false and and endpoint has been assigned.
          // For some weird reason Processing could be false and Endpoint will be null 
          if (!Processing && Endpoint) {
            resolve(data.DomainStatus);
          } else {
            resolve(false);
          }
        }
      });
    }, 1000 * 60 * 2);
  });
}

/**
 * Wait until domain is ready
 * @param {string} domainName Domain to wait for
 * @returns {Promise.<object>} Promise that resolves to 
 * Domain status when domain ready. Throw if error
 */
const waitUntilDomainReady = async (domainName) => {
  console.log('[Note] New domains take up to 10 minutes to initialize. An uninitialized domain cannot perform queries or index documents.');
  let DomainStatus = false;
  while (!DomainStatus) {
    try {
      DomainStatus = await isDomainReady(domainName);
    } catch (err) {
      throw err
    }
  }
  return DomainStatus;
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
    console.log('New ES domain created. Success');

    // If processing is not true, it means the domain was already created
    // aws doesn't complain if trying to create a domain with the name of
    // an already existing domain
    if (DomainStatus.Processing === true) {
      DomainStatus = await waitUntilDomainReady(domainName);
      console.log('==== Domain fully initialized. Ready for use. ====');
    } else {
      console.log(`Domain '${domainName}' already exists. Skipping...`)
    }
    return DomainStatus;
  } catch (err) {
    throw err;
  }
}

/**
 * Tries to create an ElasticSearch Domain. If failed due to the role
 * used in the domain access policy not being ready it will retry
 * every 5 seconds until retries are exhausted.
 * Recursion and promises! 🤯
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
 * @param {string} mapType Type of mapping that was set in the index.
 * It will be used to construct the index name and be used by the function via ENV var
 * @param {string} roleArn Role that allows access to ES domain
 **/
const createAndSetupESIndexerFunction = async (name, tableName, esDomainEndpoint, mapType, roleArn) => {
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
          "ES_MAP_TYPE": mapType,
          "ES_INDEX": mapType + 's-index' // So that index name will be 'establishments-index' or 'events-index'
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

/**
 * Creates index with the specified params with the configured client
 * @param {object} client Instance of aws-elasticsearch-client 
 * to make the request with
 * @param {object} indexParams Parameters for index to be created
  */
const createIndex = async (client, indexParams) => {
  try {
    let indexResponse = await client.indices.create(indexParams);
    return indexResponse;
  } catch (err) {
    if (err.message.includes('resource_already_exists_exception')) {
      console.log(`[Warning] => index ${indexParams.index} already exists. Skipping...`);
    } else {
      return console.log('error ==>', err);
    }
  }
}

/**
 * Creates 2 indices, one for establishments documents and one 
 * for events documents. Sets up client to make the create
 * index requests with
 * @returns  {Promise.<Array>} Array of responses from the index creation
 */
const createIndices = async () => {
  const client = ESClient({ host: domain.Endpoint })

  const establishmentsIndexParams = {
    index: 'establishment-index',
    body: {
      mappings: {
        'establishment': {
          properties: {
            address: { type: 'text' },
            displayName: { type: 'text' },
            googlePlaceId: { type: 'text' },
            id: { type: 'text' },
            location: { type: 'geo_point' },
            managerUsername: { type: 'keyword' },
            name: { type: 'text' },
            phone: { type: 'text' }
          }
        }
      }
    }
  };

  const eventsIndexParams = {
    index: 'events-index',
    body: {
      mappings: {
        'event': {
          properties: {
            atEstablishmentId: { type: 'text' },
            awayTeam: { type: 'text' },
            homeTeam: { type: 'text' },
            homeTeamBadge: { type: 'text' },
            awayTeamBadge: { type: 'text' },
            coverCharge: { type: 'boolean' },
            description: { type: 'text' },
            startTime: { type: 'date' },
            leagueId: { type: 'text' },
          }
        }
      }
    }
  };

  try {
    const estsIndex = await createIndex(client, establishmentsIndexParams);
    const eventsIndex = await createIndex(client, eventsIndexParams);
    return [estsIndex, eventsIndex];
  } catch (err) {
    return console.log('error ==>', err);
  }
}

const main = async () => {
  // Domain names don't allow uppercase characters, nor underscores in their name.
  let domainEnvPrefix = envPrefix.toLowerCase().replace('_', '-');
  let domainName = `${domainEnvPrefix}foobar-es-domain`;
  let accessRoleArn;
  let domain;
  try {
    accessRoleArn = await iam.createRoleToAccessES();
    console.log('==== Creating ES domain ====');
    domain = await tryCreateESDomain(domainName, accessRoleArn, 4);
    utils.addToCreatedInGlobalVar('esDomain', domain.DomainName);
    utils.dataSourceManager.add('AMAZON_ELASTICSEARCH', {
      name: domain.DomainName,
      arn: domain.ARN,
      endPoint: domain.Endpoint
    });

    const indices = await createIndices();
    console.log('Indices created', indices);

    console.log('==== Creating Establishment indexer function ====');
    await createAndSetupESIndexerFunction(
      `${envPrefix}foobar_establishments_DDB_ES_indexer`,
      `${envPrefix}foobar_establishments_table`,
      domain.Endpoint,
      'establishment',
      accessRoleArn
    );
    console.log('==== Creating Events indexer function ====');
    await createAndSetupESIndexerFunction(
      `${envPrefix}foobar_events_DDB_ES_indexer`,
      `${envPrefix}foobar_events_table`,
      domain.Endpoint,
      'event',
      accessRoleArn
    );
  } catch (err) {
    console.log(err);
  }
}

module.exports = main;
