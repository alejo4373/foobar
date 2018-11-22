const cognito_idp = require('aws-sdk/clients/cognitoidentityserviceprovider');
const cognito_identity = require('aws-sdk/clients/cognitoidentity');

const identityProvider = new cognito_idp();
const cognitoIdentity = new cognito_identity();

const { setGlobalVar, addToCreatedInGlobalVar } = require('./utils');
const iam = require('./iam');
const createDemoUser = require('./cognito/createDemoUser');

const newUserPoolParams = {
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

const createUserPool = (newUserPoolParams) => {
  return new Promise((resolve, reject) => {
    identityProvider.createUserPool(newUserPoolParams, (err, data) => {
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

const createUserPoolClient = (newClientParams) => {
  return new Promise((resolve, reject) => {
    identityProvider.createUserPoolClient(newClientParams, (err, data) => {
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
  let userPool;
  let userPools;

  let identityPool;
  let identityPools;
  let newIdentityPoolParams
  let identityPoolRoles;

  let client;
  let clients
  let newClientParams;

  let setIdentityPoolRolesParams;

  // UserPool Setup
  try {
    userPools = await getUserPools();
  } catch (err) {
    return console.log('[Error]', err)
  }

  userPool = userPools.find(pool => pool.Name === newUserPoolParams.PoolName)
  if (userPool) {
    console.log('Pool with the same name already exists pool id:', userPool.Id)
    console.log('=> A new pool will not be created')
  } else {
    try {
      userPool = await createUserPool(newUserPoolParams);
    } catch (err) {
      return console.log('[Error]', err)
    }
  }

  /*
   * Client Setup
   */
  try {
    clients = await getUserPoolClients(userPool.Id);
  } catch (err) {
    return console.log('[Error]', err)
  }

  newClientParams = {
    UserPoolId: userPool.Id,
    ClientName: 'foobar_app',
    RefreshTokenValidity: 30,
    ExplicitAuthFlows: [
      "USER_PASSWORD_AUTH",
      "ADMIN_NO_SRP_AUTH" //Only needed because we want to create a demo user programmatically later 
    ],
    GenerateSecret: false
  }

  client = clients.find(c => c.ClientName === newClientParams.ClientName)
  if (client) {
    console.log('User Pool Client with same name already exists clientId:', client.ClientId)
    console.log('=> A new client will not be created')
  } else {
    try {
      client = await createUserPoolClient(newClientParams);
    } catch (err) {
      return console.log('[Error]', err)
    }
    console.log('userPoolId ====>', userPool.Id)
    console.log('clientId ====>', client.ClientId)
  }

  // Identity Pool setup
  newIdentityPoolParams = {
    IdentityPoolName: 'foobar_identity_pool',
    AllowUnauthenticatedIdentities: true,
    CognitoIdentityProviders: [{
      ClientId: client.ClientId,
      ProviderName: `cognito-idp.${global.AWS.config.region}.amazonaws.com/${userPool.Id}`,
      ServerSideTokenCheck: false,
    }]
  }

  try {
    identityPools = await getIdentityPools();
  } catch (err) {
    return console.log('[Error]', err)
  }

  identityPool = identityPools.find(pool => pool.IdentityPoolName === newIdentityPoolParams.IdentityPoolName)
  if (identityPool) {
    console.log('Identity Pool with same name already exists')
    console.log('=> IdentityPool Name:', identityPool.IdentityPoolName)
    console.log('=> IdentityPool Id:', identityPool.IdentityPoolId)
    console.log('=> A new IdentityPool will not be created');
  } else {
    try {
      identityPool = await createIdentityPool(newIdentityPoolParams);
    } catch (err) {
      return console.log('[Error]', err)
    }
  }

  // Setup Identity Pool Roles
  try {
    identityPoolRoles = await Promise.all([
      iam.createAuthenticatedRoleForIdentityPoolToAccessAppSync(identityPool.IdentityPoolId, global.aws_vars.api.id),
      iam.createUnauthenticatedRoleForIdentityPoolToAccessAppSync(identityPool.IdentityPoolId, global.aws_vars.api.id)
    ])

    setIdentityPoolRolesParams = {
      IdentityPoolId: identityPool.IdentityPoolId,
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

  try {
    // To allow demo login later
    await createDemoUser(userPool.Id, client.ClientId);
  } catch (err) {
    console.log('[Error]', err)
  }

  setGlobalVar('cognito', {
    IDENTITY_POOL_ID: identityPool.IdentityPoolId,
    USER_POOL_ID: userPool.Id,
    USER_POOL_CLIENT_ID: client.ClientId
  })
  addToCreatedInGlobalVar('userPool', { id: userPool.Id, name: userPool.Name });
  addToCreatedInGlobalVar('identityPool', { id: identityPool.IdentityPoolId, name: identityPool.IdentityPoolName });
}

module.exports = main;
