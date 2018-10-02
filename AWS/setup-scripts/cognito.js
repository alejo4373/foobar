const cognitoISP = require('aws-sdk/clients/cognitoidentityserviceprovider')

const identityProvider = new cognitoISP()

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
      let poolId = data.UserPool.Id;
      console.log('New user pool created ')
      console.log('=> UserPool.Id:', poolId)
      console.log('=> UserPool.Name:', data.UserPool.Name)
      resolve(data)
    })
  })
}

const createUserPoolClient = () => {
  return new Promise(resolve => {
    identityProvider.createUserPoolClient(clientParams, (err, data) => {
      if (err) { resolve({ err: err }) }
      console.log('User Pool Client created', data)
      console.log('UserPoolClientId:')
      resolve(data)
    })
  })
}

const main = async () => {
  let userPools = await getUserPools();
  let poolId = null;
  if (userPool.err) { return console.log('[Error]', userPool.err) }

  let poolAlreadyExists = userPools.find(pool => pool.Name === userPoolParams.PoolName)
  if (poolAlreadyExists) {
    poolId = poolAlreadyExists.Id;
    console.log('Pool with the same name already exists pool id:', poolAlreadyExists.Id)
    console.log('=> A new pool will not be created')
  } else {
    const data = await createUserPool();
  }

}

module.exports = main;
