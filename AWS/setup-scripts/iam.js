const IAM = require('aws-sdk/clients/iam');
const iam = new IAM()

const createRole = (params) => {
  return new Promise(resolve => {
    iam.createRole(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      console.log('Creating Role:', params.RoleName);
      resolve(data)
    })
  })
}

const listRoles = () => {
  return new Promise((resolve, reject) => {
    iam.listRoles({}, (err, data) => {
      if (err) { reject(err) }
      resolve(data.Roles)
    })
  })
}

const putRolePolicy = (params) => {
  return new Promise(resolve => {
    iam.putRolePolicy(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      resolve(data)
    })
  })
}

const attachRolePolicy = (params) => {
  return new Promise((resolve, reject) => {
    iam.attachRolePolicy(params, (err, data) => {
      if (err) { reject(err) }
      resolve(data)
    })
  })
}

const createAuthorizedRoleForIdentityPoolToAccessAppSync = async (identityPoolId, appSyncApiId) => {
  let policyDoc = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "VisualEditor0",
        "Effect": "Allow",
        "Action": "appsync:GraphQL",
        "Resource": `arn:aws:appsync:${global.AWS.config.region}:*:apis/${appSyncApiId}/types/*/fields/*`
      }
    ]
  }

  // Somewhat explains what assumeRolePolicyDoc is about
  // https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html?icmpid=docs_iam_console
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
      }
    ]
  }

  const roleParams = {
    RoleName: 'foobar_identity_pool_authorized_role',
    Path: '/',
    Description: 'Role that grants only access to the query type of a given GraphQL API',
    AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDoc)
  };

  let role = await createRole(roleParams)
  if (role.err) {
    if (role.err.code === 'EntityAlreadyExists') {
      console.log(role.err.message, 'Skipping...')
    } else {
      console.log('[Error]', role.err)
    }
  }

  const putRolePolicyParams = {
    PolicyDocument: JSON.stringify(policyDoc),
    PolicyName: 'AppSyncQueryAccess',
    RoleName: roleParams.RoleName
  }

  let policyAttached = await putRolePolicy(putRolePolicyParams);
  if (policyAttached.err) { console.log('[Error]', policyAttached.err) }
  console.log('PolicyAttached =====>', policyAttached)
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

  const roleParams = {
    RoleName: 'lambda_basic_execution',
    Path: '/',
    Description: 'Role that grants access to the logs service to the Lambda function',
    AssumeRolePolicyDocument: JSON.stringify(assumeRolePolicyDoc)
  };

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
    }
  } catch (err) {
    console.log('[Error]', err)
  }

  const attachRolePolicyParams = {
    PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole', //AWS managed policy
    RoleName: roleParams.RoleName
  }

  let policyAttached;

  try {
    policyAttached = await attachRolePolicy(attachRolePolicyParams);
  } catch (err) {
    console.log('[Error]', err)
  }

  if (policyAttached) {
    console.log(`Role ${role.RoleName} created. Success`)
    return role.Arn;
  } else {
    return false;
  }
}

module.exports = {
  createAuthorizedRoleForIdentityPoolToAccessAppSync,
  createExecutionRoleForLambdaFunction,
}