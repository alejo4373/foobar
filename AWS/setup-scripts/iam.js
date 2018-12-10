const IAM = require('aws-sdk/clients/iam');
const { addIAMRoleAndPolicyToCreated } = require('../../utils');
const iam = new IAM()

const createRole = (params) => {
  return new Promise((resolve, reject) => {
    iam.createRole(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.Role) }
      resolve(data)
    })
  })
}

const createPolicy = (params) => {
  return new Promise((resolve, reject) => {
    iam.createPolicy(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.Policy) }
    })
  })
}

const listRoles = () => {
  return new Promise((resolve, reject) => {
    iam.listRoles({}, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.Roles) }
    })
  })
}

const attachRolePolicy = (params) => {
  return new Promise((resolve, reject) => {
    iam.attachRolePolicy(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}

const listPolicies = () => {
  return new Promise((resolve, reject) => {
    iam.listPolicies({
      Scope: 'Local' // To list only customer managed policies
    }, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.Policies) }
    })
  })
}

const createUnauthenticatedRoleForIdentityPoolToAccessAppSync = async (identityPoolId, appSyncApiId) => {
  let assumeRolePolicyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "cognito-identity.amazonaws.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "cognito-identity.amazonaws.com:aud": identityPoolId
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "unauthenticated"
          }
        }
      },
    ]
  }

  let policyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AppSyncQueryTypeAccessOnly",
        "Effect": "Allow",
        "Action": "appsync:GraphQL",
        "Resource": `arn:aws:appsync:${global.AWS.config.region}:*:apis/${appSyncApiId}/types/Query/fields/*`
      }
    ]
  }

  const roleParams = {
    RoleName: 'foobar_identity_pool_unauthenticated-role',
    Description: 'Role that grants only access to the query type of a given GraphQL API',
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: 'foobar_identity_pool_unauthenticated-policy',
  }

  let createdRoleArn;
  try {
    // Create role for cognito identity pool to access AppSync
    createdRoleArn = await createRoleFor(assumeRolePolicyDoc, roleParams, policyParams);
    return createdRoleArn;
  } catch (err) {
    console.log('[Error]', err)
  }
}

const createAuthenticatedRoleForIdentityPoolToAccessAppSync = async (identityPoolId, appSyncApiId) => {
  let assumeRolePolicyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "cognito-identity.amazonaws.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "cognito-identity.amazonaws.com:aud": identityPoolId
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated"
          }
        }
      },
    ]
  }

  let policyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AppSyncAllTypesAccess",
        "Effect": "Allow",
        "Action": "appsync:GraphQL",
        "Resource": `arn:aws:appsync:${global.AWS.config.region}:*:apis/${appSyncApiId}/types/*/fields/*`
      }
    ]
  }

  const roleParams = {
    RoleName: 'foobar_identity_pool_authenticated-role',
    Description: 'Role that grants access to all the types of a given GraphQL API',
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: 'foobar_identity_pool_authenticated-policy',
  }

  let createdRoleArn;
  try {
    // Create role for cognito identity pool to access AppSync
    createdRoleArn = await createRoleFor(assumeRolePolicyDoc, roleParams, policyParams);
    return createdRoleArn;
  } catch (err) {
    console.log('[Error]', err)
  }
}

const createExecutionRoleForLambdaFunction = async () => {
  // The trust relationship policy document that grants an entity permission to assume the role. 
  let assumeRolePolicyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }

  let policyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource": "arn:aws:logs:*:*:*"
      }
    ]
  }

  const roleParams = {
    RoleName: 'lambda_basic_execution-role',
    Description: 'Role that grants access to the logs service to the Lambda function',
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: 'lambda_basic_execution-policy'
  }

  let createdRoleArn;
  try {
    // Create role for lambda to be able to put logs in CloudWatch
    createdRoleArn = await createRoleFor(assumeRolePolicyDoc, roleParams, policyParams);
    return createdRoleArn;
  } catch (err) {
    console.log('[Error]', err)
  }
}

const createRoleFor = async (assumeRolePolicyDoc, roleParams, policyParams) => {
  roleParams = {
    AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDoc),
    Path: '/',
    ...roleParams
  }

  let roles;
  let role;

  try {
    // Get roles to verify a duplicate role is not created
    roles = await listRoles();
    role = roles.find(r => r.RoleName === roleParams.RoleName);

    if (role) {
      console.log(`Role with name ${role.RoleName} already exists. Skipping...`)
    } else {
      role = await createRole(roleParams)
      console.log(`Role with name ${role.RoleName} created. Success...`)
    }
  } catch (err) {
    console.log('[Error]', err)
  }

  // Create a new policy if no other with same name exists
  let policies;
  let policy;
  try {
    policies = await listPolicies();
    policy = policies.find(p => p.PolicyName === policyParams.PolicyName);
    if (policy) {
      console.log(`Policy with name ${policyParams.PolicyName} already exists. Skipping...`)
    } else {
      policy = await createPolicy(policyParams)
      console.log(`Policy with name ${policy.PolicyName} created. Success...`)
    }

  } catch (err) {
    console.log('[Error]', err)
  }

  const attachRolePolicyParams = {
    PolicyArn: policy.Arn,
    RoleName: role.RoleName
  }

  try {
    await attachRolePolicy(attachRolePolicyParams);
    console.log(`Policy "${policy.PolicyName}" attached to role "${role.RoleName}". Success`)
    addIAMRoleAndPolicyToCreated({ RoleName: role.RoleName, PolicyArn: policy.Arn });
    return (role.Arn);
  } catch (err) {
    return false;
  }
}

const createRoleForAppSyncToAccessDataSource = async (type, dataSourceName, dataSourceArn) => {

  // The trust relationship policy document that grants an entity permission to assume the role. 
  let assumeRolePolicyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "appsync.amazonaws.com"
        },
        "Action": "sts:AssumeRole",
      },
    ]
  }

  const roleParams = {
    RoleName: `appsync-datasource-${dataSourceName}-role`,
    Description: 'Role that grants access to the AppSync service to the DynamoDB Table',
  };

  const policyDoc = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: `${type}Access`,
        Effect: "Allow",
        Action: [], //Will be set based on the type of data source below
        Resource: [] //Will be set based on the type of data source below
      }
    ]
  }

  // Define policyDoc Action and Resource based on data source type
  switch (type) {
    case 'dynamoDBTable':
      policyDoc.Statement[0].Action = [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ]
      policyDoc.Statement[0].Resource = [dataSourceArn, dataSourceArn + '/*']
      break;

    case 'lambdaFunction':
      policyDoc.Statement[0].Action = [
        "lambda:invokeFunction"
      ]
      policyDoc.Statement[0].Resource = [dataSourceArn, dataSourceArn + ':*']
      break;
  }


  let policyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: `appsync-datasource-${dataSourceName}-policy`,
  };

  let createdRoleArn;
  try {
    // Create role for AppSync to access dynamodb
    createdRoleArn = await createRoleFor(assumeRolePolicyDoc, roleParams, policyParams);
  } catch (err) {
    console.log('[Error]', err)
  }

  return createdRoleArn
}

const createRoleForLambdaToAccessES = async () => {
  // The trust relationship policy document that grants an entity permission to assume the role. 
  let assumeRolePolicyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }

  let policyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "LogsDDBESAccess",
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams",
          "dynamodb:GetRecords",
          "es:ESHttpPost",
          "es:ESHttpDelete",
          "es:ESHttpPut",
        ],
        "Resource": "*"
      }
    ]
  }

  const roleParams = {
    RoleName: 'foobar_lambda_DDB_ES_execution-role',
    Description: 'Role that allows function to write logs, read table streams and talk to the elasticsearch service',
  };

  const policyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: 'foobar_lambda_DDB_ES_execution-policy'
  }

  let createdRoleArn;
  try {
    createdRoleArn = await createRoleFor(assumeRolePolicyDoc, roleParams, policyParams);
    return createdRoleArn;
  } catch (err) {
    console.log('[Error]', err)
  }
}

module.exports = {
  createUnauthenticatedRoleForIdentityPoolToAccessAppSync,
  createAuthenticatedRoleForIdentityPoolToAccessAppSync,
  createExecutionRoleForLambdaFunction,
  createRoleForAppSyncToAccessDataSource,
  createRoleForLambdaToAccessES,
}
