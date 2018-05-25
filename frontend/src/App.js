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
    userLoggedIn: false
  }

  componentDidMount() {
   //Check if user has a session i.e is logged in
    Auth.currentSession()
        .then( () => this.handleLogInSuccess() )
        .catch(err => console.log('error in promis', err))
  }

  handleLogInSuccess = () => {
    this.setState({
      userLoggedIn: true
    })
  }

  handleLogOut = () => {
    this.setState({
      userLoggedIn: false
    })
  }

  render() {
    const { userLoggedIn } = this.state
    return (
      //If user is logged in we render Dashboard
      userLoggedIn? 
        <Dashboard handleLogOut={this.handleLogOut}/> 
      : <UserAuth handleLogInSuccess={this.handleLogInSuccess} />
    )
  }
}

export default App
