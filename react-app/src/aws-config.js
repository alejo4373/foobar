//AWS Amplify configuration
export default {
  //AppSync conf
  "aws_appsync_graphqlEndpoint": process.env.REACT_APP_GRAPHQL_ENDPOINT,
  "aws_appsync_region": "us-east-2",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  // "aws_appsync_apiKey": process.env.REACT_APP_APP_SYNC_API_KEY,
  Auth: {
    identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
    region: 'us-east-2', 
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID, 
  } 
}