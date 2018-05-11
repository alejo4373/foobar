import React, { Component } from 'react';
import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from 'aws-appsync/lib/link/auth-link';
import { graphql, ApolloProvider, compose } from 'react-apollo';
import * as AWS from 'aws-sdk';
import AppSyncConfig from './AppSync';
import { AppSync } from 'aws-sdk';
import { AuthenticationDetails } from 'amazon-cognito-identity-js';

import GetAllEstablishments from './Queries/GetAllEstablishments'
import GetAllEvents from './Queries/GetAllEvents'

//Components
import SignUpForm from './Components/SignUpForm';
import LogInForm from './Components/LogInForm';
import AllEstablishments from './Components/AllEstablishments';
import AllEvents from './Components/AllEvents';

const client = new AWSAppSyncClient({
  url: AppSyncConfig.graphqlEndpoint,
  region: AppSyncConfig.region,
  auth: { 
    type: AUTH_TYPE.API_KEY,
    apiKey: AppSyncConfig.apiKey
  }
})

const AllEventsWithData = compose(
  graphql(GetAllEvents, {
    options: {
      fetchPolicy: 'cache-and-network',
    },
    props: (props) => {
      console.log('AllEventsWithData props ==>', props)
      return({
      //Props we want to pass into AllEvents component coming from the graphql request
       events: props.data.allEvents.events
      })
    }
  })
)(AllEvents);

const AllEstablishmentsWithData = compose(
  graphql(GetAllEstablishments, {
    options: {
      fetchPolicy: 'cache-and-network',
    },
    props: (props) => {
      console.log('AllEstablishmentsWithData props ==>', props)
      return({
      //Props we want to pass into AllEvents component coming from the graphql request
      establishments: props.data.allEstablishments.establishments
      })
    }
  })
)(AllEstablishments);

class App extends Component {
  state = {
    singUpSuccess: false,
    user: {},
    toogleSignUp: true
  }

  handleSignUpResponse = (res) => {
    console.log('response=======>', res)
    if(res.user) {
      this.setState({
        singUpSuccess: true,
        user: res.user,
        message: 'You have signed up and can now log in'
      })  
    }
    else {
      this.setState({
        singUpSuccess: false,
        user: null,
        message: res.message,
      })
    }
  }

  handleToogleForms = () => {
    this.setState(prevState => {
      return {toogleSignUp: !prevState.toogleSignUp}
    })
  }

  render() {
    console.log(this.state)
    const { message, toogleSignUp } = this.state
    return (
      <div className="App">
      {
        toogleSignUp 
          ? <SignUpForm handleSignUpResponse={this.handleSignUpResponse}/>
          : <LogInForm handleLogInResponse={this.handleLogInResponse} />
      }
      <p>{message}</p>
      <p onClick={this.handleToogleForms}>{toogleSignUp ? 'Log In' : 'Sign Up'}</p>

    <AllEstablishmentsWithData/>
    <AllEventsWithData/>
      </div>
    );
  }
}

const AppWithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
)

export default AppWithProvider;
