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

const main = () => {
  identityProvider.listUserPools({ MaxResults: 10 }, (err, data) => {
    if (err) { return console.log('[Error]', err) }

    const { UserPools } = data
    let poolAlreadyExists = UserPools.find(pool => pool.Name === userPoolParams.PoolName)

    if (poolAlreadyExists) {
      console.log('Pool with the same name already exists pool id:', poolAlreadyExists.Id)
      console.log('=> A new pool will not be created')
    } else {
      identityProvider.createUserPool(userPoolParams, (err, data) => {
        if (err) { return console.log(err) }
        console.log('New user pool created ')
        console.log('=> UserPool.Id:', data.UserPool.Id)
        console.log('=> UserPool.Name:', data.UserPool.Name)
      })
    }
  })

}

module.exports = main;
