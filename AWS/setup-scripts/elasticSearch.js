const { createRoleForLambdaToAccessES } = require('../setup-scripts/iam');
// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })

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
    let res = await ES.createElasticsearchDomain(esDomainParams).promise();

    // If processing is not true, it means the domain was already created
    // aws doesn't complain if trying to create a domain with the name of
    // an already existing domain
    if (res.DomainStatus.Processing === true) {
      console.log('New ES domain created. Success');
      await waitUntilDomainReady(domainName);
    } else {
      console.log(`Domain '${domainName}' already exists. Skipping...`)
    }
  } catch (err) {
    throw err;
  }
}

const main = async () => {
  let domainName = 'foobar-es-domain';
  let roleArn;
  try {
    roleArn = await createRoleForLambdaToAccessES();
    await createESDomain(domainName, roleArn);
  } catch (err) {
    console.log(err);
  }
}

module.exports = main;
