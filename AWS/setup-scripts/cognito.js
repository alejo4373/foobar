const cognito_idp = require('aws-sdk/clients/cognitoidentityserviceprovider');
const cognito_identity = require('aws-sdk/clients/cognitoidentity');

const identityProvider = new cognito_idp();
const cognitoIdentity = new cognito_identity();

const iam = require('./iam');
const { setGlobalVar } = require('./utils');

const userPoolParams = {
  PoolName: 'foobar_user_pool',
  Policies: {
    PasswordPolicy: {
      MinimumLength: 8,
      RequireLowercase: true,
      RequireNumbers: true,
      RequireSymbols: true,
      RequireUppercase: true
    }
  },
  Schema: [
    {
      AttributeDataType: 'String',
      DeveloperOnlyAttribute: false,
      Mutable: true,
      Name: 'email',
      Required: true,
      StringAttributeConstraints: {
        MaxLength: "2048",
        MinLength: "0"
      }
    },
  ],
  AutoVerifiedAttributes: ['email'],
  VerificationMessageTemplate: {
    EmailMessage: 'You verification code is {####}. ',
    EmailSubject: 'Thank you for signing up with FooBar you verification....',
    DefaultEmailOption: 'CONFIRM_WITH_CODE',
  }
};

const getUserPools = () => {
  return new Promise((resolve, reject) => {
    identityProvider.listUserPools({ MaxResults: 10 }, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data.UserPools) }
    })
  })

}

const createUserPool = (userPoolParams) => {
  return new Promise((resolve, reject) => {
    identityProvider.createUserPool(userPoolParams, (err, data) => {
      if (err) { reject(err) }
      else {
        let userPoolId = data.UserPool.Id;
        console.log('New user pool created ')
        console.log('=> UserPool.Id:', userPoolId)
        console.log('=> UserPool.Name:', data.UserPool.Name)
        resolve(data.UserPool)
      }
    })
  })
}

const createUserPoolClient = (clientParams) => {
  return new Promise((resolve, reject) => {
    identityProvider.createUserPoolClient(clientParams, (err, data) => {
      if (err) { reject(err) }
      else {
        const { UserPoolClient } = data
        console.log('User Pool Client created')
        console.log('=> UserPoolClient.ClientId', UserPoolClient.ClientId)
        console.log('=> UserPoolClient.ClientName', UserPoolClient.ClientName)
        resolve(UserPoolClient)
      }
    })
  })
}

const getUserPoolClients = (poolId) => {
  let params = {
    UserPoolId: poolId,
    MaxResults: 5,
  }
  return new Promise((resolve, reject) => {
    identityProvider.listUserPoolClients(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.UserPoolClients)
      }
    })
  })
}

const getIdentityPools = () => {
  let params = {
    MaxResults: 5,
  }
  return new Promise((resolve, reject) => {
    cognitoIdentity.listIdentityPools(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.IdentityPools)
      }
    })
  })
}

const createIdentityPool = (params) => {
  return new Promise((resolve, reject) => {
    cognitoIdentity.createIdentityPool(params, (err, data) => {
      if (err) { reject(err) }
      else {
        console.log('Identity Pool created')
        console.log('=> IdentityPool Id:', data.IdentityPoolId)
        console.log('=> IdentityPool Name:', data.IdentityPoolName)
        resolve(data)
      }
    })
  })
}

const setIdentityPoolRoles = (params) => {
  return new Promise((resolve, reject) => {
    cognitoIdentity.setIdentityPoolRoles(params, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data)
      }
    })
  })
}

const main = async () => {
  let userPoolId = null;
  let clientId = null;
  let identityPoolId = null;

  // UserPool Setup
  let userPools;
  try {
    userPools = await getUserPools();
  } catch (err) {
    return console.log('[Error]', err)
  }

  let poolAlreadyExists = userPools.find(pool => pool.Name === userPoolParams.PoolName)
  if (poolAlreadyExists) {
    userPoolId = poolAlreadyExists.Id;
    console.log('Pool with the same name already exists pool id:', poolAlreadyExists.Id)
    console.log('=> A new pool will not be created')
  } else {
    let userPool;
    try {
      userPool = await createUserPool(userPoolParams);
    } catch (err) {
      return console.log('[Error]', err)
    }
    userPoolId = userPool.Id;
  }

  // Client Setup
  let clientParams = {
    UserPoolId: userPoolId,
    ClientName: 'foobar_app',
    RefreshTokenValidity: 30,
    ExplicitAuthFlows: ["USER_PASSWORD_AUTH"],
    GenerateSecret: false
  }

  let clients
  try {
    clients = await getUserPoolClients(userPoolId);
  } catch (err) {
    return console.log('[Error]', err)
  }

  let clientAlreadyExits = clients.find(client => client.ClientName === clientParams.ClientName)
  if (clientAlreadyExits) {
    clientId = clientAlreadyExits.ClientId;
    console.log('User Pool Client with same name already exists clientId:', clientAlreadyExits.ClientId)
    console.log('=> A new client will not be created')
  } else {
    let client;
    try {
      client = await createUserPoolClient(clientParams);
    } catch (err) {
      return console.log('[Error]', err)
    }
    clientId = client.ClientId;
    console.log('userPoolId ====>', userPoolId)
    console.log('clientId ====>', clientId)
  }

  // Identity Pool setup
  let identityPoolParams = {
    IdentityPoolName: 'foobar_identity_pool',
    AllowUnauthenticatedIdentities: true,
    CognitoIdentityProviders: [{
      ClientId: clientId,
      ProviderName: `cognito-idp.${global.AWS.config.region}.amazonaws.com/${userPoolId}`,
      ServerSideTokenCheck: false,
    }]
  }

  let identityPools;
  try {
    identityPools = await getIdentityPools();
  } catch (err) {
    return console.log('[Error]', err)
  }

  let identityPoolAlreadyExists = identityPools.find(pool => pool.IdentityPoolName === identityPoolParams.IdentityPoolName)
  if (identityPoolAlreadyExists) {
    identityPoolId = identityPoolAlreadyExists.IdentityPoolId;
    console.log('Identity Pool with same name already exists')
    console.log('=> IdentityPool Name:', identityPoolAlreadyExists.IdentityPoolName)
    console.log('=> IdentityPool Id:', identityPoolAlreadyExists.IdentityPoolId)
    console.log('=> A new IdentityPool will not be created');

  } else {
    let identityPool;
    try {
      identityPool = await createIdentityPool(identityPoolParams);
      identityPoolId = identityPool.IdentityPoolId
    } catch (err) {
      return console.log('[Error]', err)
    }
  }

  // Setup Identity Pool Roles
  try {
    let identityPoolRoles = await Promise.all([
      iam.createAuthenticatedRoleForIdentityPoolToAccessAppSync(identityPoolId, global.aws_vars.api.id),
      iam.createUnauthenticatedRoleForIdentityPoolToAccessAppSync(identityPoolId, global.aws_vars.api.id)
    ])

    let setIdentityPoolRolesParams = {
      IdentityPoolId: identityPoolId,
      Roles: {
        authenticated: identityPoolRoles[0],
        unauthenticated: identityPoolRoles[1],
      }
    }
    try {
      await setIdentityPoolRoles(setIdentityPoolRolesParams)
    } catch (err) {
      return console.log('[Error]', err)
    }
  } catch (err) {
    return console.log('[Error]', err)
  }
  setGlobalVar('cognito', {
    IDENTITY_POOL_ID: identityPoolId,
    USER_POOL_ID: userPoolId,
    USER_POOL_CLIENT_ID: clientId
  })
}

module.exports = main;
