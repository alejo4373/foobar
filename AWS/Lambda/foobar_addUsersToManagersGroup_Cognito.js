//Ref Doc: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-post-confirmation.htmlp
//This function will be run as soon as a user confirms their registration
//and we want if they so chose to add them to the managers user group

const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'})

exports.handler = (event, context, callback) => {
  const { userAttributes } = event.request
  console.log('event =====> \n', event)

  //If managerBool is 1 for true, add user to the bar_managers group
  if(userAttributes['custom:managerBool'] === '1' ) {
    const params = {
      GroupName: 'bar_managers', 
      UserPoolId: event.userPoolId,
      Username: event.userName
    }
    console.log('params ====>', params)
    cognitoIdentityServiceProvider.adminAddUserToGroup(params, (err, data) => {
      if(err) {
         console.log(err, err.stack);
      } else { 
        //All went well
        callback(null, event)
      }
    })

  //User is not manager so respond to cognito with same event
  } else {
   console.log('User is not manager')
   callback(null, event) 
  }
  console.log('========= FUNCTION FINISHED ==========')
}