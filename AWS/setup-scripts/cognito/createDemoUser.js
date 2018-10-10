const cognito_idp = require('aws-sdk/clients/cognitoidentityserviceprovider');
const identityProvider = new cognito_idp();

const createDemoUser = async (userPoolId, clientId) => {
  console.log('####### Creating Demo User ########')
  userPoolId = 'us-east-1_Q2jqKrgNp';
  clientId = 'h0ou2umnueshapqfdd6732qc7'

  let createUserParams = {
    UserPoolId: userPoolId,
    Username: 'EstablishmentManagerDemoUser',
    UserAttributes: [
      {
        Name: 'email',
        Value: 'alejo4373@gmail.com'
      },
      {
        Name: 'email_verified',
        Value: 'true'
      },
    ],
    DesiredDeliveryMediums: ["EMAIL"],
    MessageAction: 'SUPPRESS',
    TemporaryPassword: "HelloThere123$",

  }
  try {
    let { User } = await identityProvider.adminCreateUser(createUserParams).promise();
    console.log(`Created demo user ${User.Username}. Success!`);

    // Initiate auth
    let initiateAuthParams = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: clientId,
      UserPoolId: userPoolId,
      AuthParameters: {
        USERNAME: createUserParams.Username,
        PASSWORD: createUserParams.TemporaryPassword
      },
      ContextData: {
        HttpHeaders: [],
        IpAddress: '127.0.0.1',
        ServerName: 'myServer',
        ServerPath: 'http://localhost:3000/'
      }
    }

    try {
      let { ChallengeName, Session } = await identityProvider.adminInitiateAuth(initiateAuthParams).promise();
      console.log(`Initiated auth for demo user ${User.Username}. Success!`);

      // Respond to NEW_PASSWORD_REQUIRED challenge setting the password
      let respondToChallengeParams = {
        ClientId: clientId,
        ChallengeName,
        Session,
        ChallengeResponses: {
          USERNAME: createUserParams.Username,
          NEW_PASSWORD: "HelloWorld123$"
        }
      }

      try {
        await identityProvider.respondToAuthChallenge(respondToChallengeParams).promise();
        let { NEW_PASSWORD } = respondToChallengeParams.ChallengeResponses;
        console.log(`Set new password for demo user ${User.Username} to be ${NEW_PASSWORD}. Success!`);

      } catch (err) {
        console.log('[Error]\n', err)
      }
    } catch (err) {
      console.log('[Error]\n', err)
    }
  } catch (err) {
    console.log('[Error]\n', err)
  }
}

module.exports = createDemoUser;