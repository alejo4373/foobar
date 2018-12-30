import React, { Component } from 'react';
import './Stylesheets/app.css';
import AWSESClient from 'aws-elasticsearch-client'

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
    this.setupESClient();
  }

  // Get current AWS credentials attach as this.esClient 
  // the created ES domain client with region and ES domain
  // endpoint specified in the environment 
  setupESClient = () => {
    Auth.currentCredentials()
      .then(credentials => {
        this.esClient = AWSESClient({
          host: process.env.REACT_APP_ES_DOMAIN_ENDPOINT,
          region: process.env.REACT_APP_AWS_REGION,
          credentials: credentials
        })
      })
      .catch(err => console.log('Error getting current credentials', err))
  }

  searchIndex = async () => {
    try {
      let res = await this.esClient.search({
        q: 'awayTeam:new york'
      });
      console.log('index-query res =>', res)
    } catch (err) {
      console.log('index-query err =>', err)
    }
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
        <button onClick={this.searchIndex} >click</button>
      </UserContext.Provider>
    )
  }
}

export default App
