const { createRoleForLambdaToAccessES } = require('../setup-scripts/iam');
// AWS must be in the global scope
const ES = new AWS.ES({ apiVersion: '2015-01-01' })

const createESDomain = (domainName, roleArn) => {
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
  return ES.createElasticsearchDomain(esDomainParams).promise()         // successful response
}
const main = async () => {
  let domainName = 'foobar-es-domain';
  let roleArn;
  try {
    roleArn = await createRoleForLambdaToAccessES();
    let res = await createESDomain(domainName, roleArn);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}

module.exports = main;
