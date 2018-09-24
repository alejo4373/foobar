import React, { Component } from 'react';
import './Stylesheets/app.css';

//Child component 
import Dashboard from './Components/Dashboard';

//Context
import UserContext from './contexts/user-context';

//Amplify setup
import Amplify, { Auth } from 'aws-amplify';
import awsConfig from './aws-config';
Amplify.configure(awsConfig);

const setUsernameHeader = (username) => {
  //Reconfigure Amplify to include username as a header in the request
  Amplify.configure({
    API: {
      graphql_headers: async () => ({
        'username': username
      })
    }
  })
}

class App extends Component {
  state = {
    user: null,
    signUpSuccess: false,
    fetchingUser: true,
    message: ''
  }

  componentDidMount() {
    console.log('App DidMount')
    this.fetchCurrentUser()
  }

  fetchCurrentUser = () => {
    //Check if user has a session i.e is logged in
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('user arrived')
        setUsernameHeader(user.username);
        this.setState({
          user: user,
          fetchingUser: false
        })
      })
      .catch(err => {
        this.setState({
          fetchingUser: false,
        })
        console.log('Error:', err)
      })
  }

  logInUser = (username, password) => {
    console.log('logging user', username, password)
    Auth.signIn(username, password)
      .then(user => {
        setUsernameHeader(user.username);
        console.log(user)
        this.setState({
          user: user,
        })
      })
      .catch(err => {
        this.setState({
          message: 'Wrong username or password'
        })
        console.log('err logging in', err)
      })
  }

  logOutUser = () => {
    Auth.signOut()
      .then(() => {
        this.setState({
          user: null,
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
        if (typeof (err) === 'string') {
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
    const { user, message, fetchingUser } = this.state
    const contextValue = {
      user,
      fetchingUser,
    }
    console.log('App Render')
    return (
      <UserContext.Provider value={contextValue} >
        <Dashboard
          user={user}
          message={message}
          signUpUser={this.signUpUser}
          logInUser={this.logInUser}
          logOutUser={this.logOutUser}
        />
      </UserContext.Provider>
    )
  }
}

export default App
