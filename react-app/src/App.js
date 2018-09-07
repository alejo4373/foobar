import React, { Component } from 'react';

//Main components 
import UserAuth from './Components/UserAuth';
import Dashboard from './Components/Dashboard';

//Amplify setup
import Amplify, { Auth } from 'aws-amplify';
import awsConfig from './aws-config';
Amplify.configure(awsConfig);

class App extends Component {
  state = {
    user: null,
    signUpSuccess: false,
    message: ''
  }

  componentDidMount() {
    //Check if user has a session i.e is logged in
    console.log('App didMount')
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('session from .currentSession()', user)
        this.setState({
          user: user,
        })
      })
      .catch(err => {
        console.log('Error:', err)
      })
  }

  logInUser = (username, password) => {
    console.log('logging user', username, password)
    Auth.signIn(username, password)
      .then(user => {
        console.log(user)
        this.setState({
          user: user,
        })
      })
      .catch(err => console.log('err logging in', err))
  }

  logOutUser = () => {
    Auth.signOut()
      .then(() => {
        this.setState({
          user: null
        })
      })
      .catch(err => console.log('logged out err', err))
  }

  signUpUser = (user) => {
    const { username, password, email } = user

    Auth.signUp({
      username,
      password,
      attributes: {
        email
      }
    })
      .then(data => {
        this.setState({
          message: 'signUpSuccess'
        })
        console.log(data)
      })
      .catch(err => {
        let errorMessage;  
        console.log(typeof(err))
        if(typeof(err) === 'string') {
          errorMessage = err
        } else {
          errorMessage = err.message || 'There was an error'
        }

        this.setState({
          message: errorMessage
        })
        console.log('error signing up user', err)
      })
  }

  render() {
    const { user, message, signUpSuccess } = this.state
    return (
      <Dashboard
        user={user}
        message={message}
        logOutUser={this.logOutUser}
        logInUser={this.logInUser}
        signUpUser={this.signUpUser}
      />
    )
  }
}

export default App
