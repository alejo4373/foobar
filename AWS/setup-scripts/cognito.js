const cognito_idp = require('aws-sdk/clients/cognitoidentityserviceprovider');
const cognito_identity = require('aws-sdk/clients/cognitoidentity');

const identityProvider = new cognito_idp();
const cognitoIdentity = new cognito_identity();

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
  return new Promise(resolve => {
    identityProvider.listUserPools({ MaxResults: 10 }, (err, data) => {
      if (err) { resolve({ err: err }) }
      else { resolve(data.UserPools) }
    })
  })

}

const createUserPool = () => {
  return new Promise(resolve => {
    identityProvider.createUserPool(userPoolParams, (err, data) => {
      if (err) { resolve({ err: err }) }
      let userPoolId = data.UserPool.Id;
      console.log('New user pool created ')
      console.log('=> UserPool.Id:', userPoolId)
      console.log('=> UserPool.Name:', data.UserPool.Name)
      resolve(data)
    })
  })
}

const createUserPoolClient = (clientParams) => {
  return new Promise(resolve => {
    identityProvider.createUserPoolClient(clientParams, (err, data) => {
      if (err) { resolve({ err: err }) }
      const { UserPoolClient } = data
      console.log('User Pool Client created')
      console.log('=> UserPoolClient.ClientId', UserPoolClient.ClientId)
      console.log('=> UserPoolClient.ClientName', UserPoolClient.ClientName)
      resolve(UserPoolClient)
    })
  })
}

const getUserPoolClients = (poolId) => {
  let params = {
    UserPoolId: poolId,
    MaxResults: 5,
  }
  return new Promise(resolve => {
    identityProvider.listUserPoolClients(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      resolve(data.UserPoolClients)
    })
  })
}

const getIdentityPools = () => {
  let params = {
    MaxResults: 5,
  }
  return new Promise(resolve => {
    cognitoIdentity.listIdentityPools(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      resolve(data.IdentityPools)
    })
  })
}

const createIdentityPool = (params) => {
  return new Promise(resolve => {
    cognitoIdentity.createIdentityPool(params, (err, data) => {
      if (err) { resolve({ err: err }) }
      console.log('Identity Pool created')
      console.log('=> IdentityPool Id:', data.IdentityPoolId)
      console.log('=> IdentityPool Name:', data.IdentityPoolName)
      resolve(data)
    })
  })
}

const main = async () => {
  let userPoolId = null;
  let clientId = null;
  let identityPoolId = null;

  // UserPool Setup
  let userPools = await getUserPools();
  if (userPools.err) { return console.log('[Error]', userPools.err) }
  let poolAlreadyExists = userPools.find(pool => pool.Name === userPoolParams.PoolName)
  if (poolAlreadyExists) {
    userPoolId = poolAlreadyExists.Id;
    console.log('Pool with the same name already exists pool id:', poolAlreadyExists.Id)
    console.log('=> A new pool will not be created')
  } else {
    const data = await createUserPool(userPoolId);
    if (data.err) { return console.log('[Error]', data.err) }
    userPoolId = data.UserPool.Id;
  }

  // Client Setup
  let clientParams = {
    UserPoolId: userPoolId,
    ClientName: 'foobar_app',
    RefreshTokenValidity: 30,
    ExplicitAuthFlows: ["USER_PASSWORD_AUTH"],
    GenerateSecret: false
  }

  const clients = await getUserPoolClients(userPoolId);
  if (clients.err) { return console.log('[Error]', clients.err) }

  let clientAlreadyExits = clients.find(client => client.ClientName === clientParams.ClientName)
  if (clientAlreadyExits) {
    clientId = clientAlreadyExits.ClientId;
    console.log('User Pool Client with same name already exists clientId:', clientAlreadyExits.ClientId)
    console.log('=> A new client will not be created')
  } else {
    const client = await createUserPoolClient(clientParams);
    if (client.err) { return console.log('[Error]', client.err) }
    clientId = client.ClientId;
    console.log('userPoolId ====>', userPoolId)
    console.log('clientId ====>', clientId)
  }

  // Identity Pool setup
  let identityPoolParams = {
    IdentityPoolName: 'foobar_identity_pool_z',
    AllowUnauthenticatedIdentities: true,
    CognitoIdentityProviders: [{
      ClientId: clientId,
      ProviderName: `cognito-idp.${global.AWS.config.region}.amazonaws.com/${userPoolId}`,
      ServerSideTokenCheck: false,
    }]
  }

  const identityPools = await getIdentityPools();
  if (identityPools.err) { return console.log('[Error]', clients.err) }

  let identityPoolAlreadyExists = identityPools.find(pool => pool.IdentityPoolName === identityPoolParams.IdentityPoolName)
  if (identityPoolAlreadyExists) {
    identityPoolId = identityPoolAlreadyExists.IdentityPoolId;
    console.log('Identity Pool with same name already exists')
    console.log('=> IdentityPool Name:', identityPoolAlreadyExists.IdentityPoolName)
    console.log('=> IdentityPool Id:', identityPoolAlreadyExists.IdentityPoolId)
    console.log('=> A new IdentityPool will not be created');

  } else {
    const identityPool = await createIdentityPool(identityPoolParams);
    identityPoolId = identityPool.IdentityPoolId
  }
}

module.exports = main;
