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

  render() {
    const { user } = this.state
    return (
      <Dashboard user={user} logOutUser={this.logOutUser} logInUser={this.logInUser} />
    )
  }
}

export default App
