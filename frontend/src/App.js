import React, { Component } from 'react';

//Components 
import SignUpForm from './Components/SignUpForm';
import LogInForm from './Components/LogInForm';
import AllEvents from './Components/AllEvents';
import AllEstablishments from './Components/AllEstablishments';

//Aws amplify
import awsConfig from './aws-config';
import Amplify , { API, graphqlOperation } from 'aws-amplify';
import { Authenticator, withAuthenticator } from 'aws-amplify-react';

//GraphQL operations
import GetAllEvents from "./Queries/GetAllEvents";

Amplify.configure(awsConfig);
class App extends Component {
  state = {
    user: {},
    events: []
  }

  componentDidMount() {
    this.getData()
  }

  async getData() {
    try {
      const res = await API.graphql(graphqlOperation(GetAllEvents));
      this.setState({
        events: res.data.allEvents.events
      })
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    console.log(this.state)
    const { events } = this.state
    return (
      <div className="App">
        <SignUpForm/>
        {/* <AllEvents events={events}/> */}
      </div>
    );
  }
}

export default App
