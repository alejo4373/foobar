import { CognitoUserPool } from 'amazon-cognito-identity-js';
let poolData = {
  UserPoolId: 'us-east-2_guN0Taogy',
  ClientId: '1mdak0hqtoenemg8etvvjjc8ht',
}

let userPool = new CognitoUserPool(poolData)

export default userPool