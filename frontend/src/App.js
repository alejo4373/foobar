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
      .then( () => {
        this.setState({
          userLoggedIn: true
        }) 
      })
      .catch(err => {
        //Log in with guest credentials
        this.logInUser('guest', '$Guest$123')
        console.log('error in Auth.currentSession', err)
      })
  }

  logInUser = (username, password) => {
    Auth.signIn(username, password)
      .then(user => {
        console.log(user)
        this.setState({
          userLoggedIn: true
        })
      })
      .catch(err => console.log('err logging in', err))
  }

  logOutUser = () => {
    Auth.signOut()
      .then(() => {
        this.setState({
          userLoggedIn: false
        })
      })
      .catch(err => console.log('logged out err', err))
  }

  render() {
    const { userLoggedIn } = this.state
    return (
      //If user is logged in we render Dashboard
      userLoggedIn? 
        <Dashboard logOutUser={this.logOutUser}/> 
      : <UserAuth logInUser={this.logInUser} />
    )
  }
}

export default App
