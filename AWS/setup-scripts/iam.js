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

const putRolePolicy = (params) => {
  return new Promise(resolve => {
    iam.putRolePolicy(params, (err, data) => {
      if (err) { resolve({ err: err }) }
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


module.exports = {
  createAuthorizedRoleForIdentityPoolToAccessAppSync,
}