//AWS Amplify configuration
export default {
  //AppSync conf
  "aws_appsync_graphqlEndpoint": process.env.REACT_APP_GRAPHQL_ENDPOINT,
  "aws_appsync_region": "us-east-1",
  "aws_appsync_authenticationType": "AWS_IAM",
  Auth: {
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    region: 'us-east-1', 
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID, 
  } 
}