import React, { Component } from 'react';
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import userPool from '../pool';

import AWS from 'aws-sdk';
AWS.config.region = 'us-east-2'

export default class LogInForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      data: {}
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = this.state
    let authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password
    })

    let userData = {
      Username: username,
      Pool: userPool
    }

    let cognitoUser = new CognitoUser(userData)
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (res) => {
        console.log('onSuccess, access token===>', res.getAccessToken().getJwtToken());
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'us-east-2:c1851d62-3382-4c03-bbe1-c28ae343454a',
          Logins: {
            'cognito-idp.us-east-2.amazonaws.com/us-east-2_guN0Taogy': res.getIdToken().getJwtToken()
          }
        });
        //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        AWS.config.credentials.refresh((err) => {
          if(err) { console.log('err refreshing credentials====>', err)}
          else {
             // Instantiate aws sdk service objects now that the credentials have been updated.
             // example: var s3 = new AWS.S3();
            console.log('successfully loggedIn')
          }
        })
      },

      onFailure: (err) => {
        console.log('onFailure =====>', err)
      }
    })
  }

  handleInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  render() {
    console.log(this.state)
    const { username, password } = this.state
    return (
      <div>
        <h3> Log In </h3>
        <form onSubmit={this.handleSubmit}>
          <label> Username </label>
          <input type='text' id='username' value={username} onChange={this.handleInput} />
          <label> Password </label>
          <input type='text' id='password' value={password} onChange={this.handleInput} />
          <input type='submit' value='Log In'/>
        </form>
      </div>
    )
  }
}