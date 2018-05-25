import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

//Components
import NavigationBar from './Dashboard/NavigationBar'
import AllEvents from './AllEvents';
import AllEstablishments from './AllEstablishments';

//Amplify 
import { API, graphqlOperation } from 'aws-amplify'

//GraphQL operations
import GetAllEvents from "../Queries/GetAllEvents";


//Temporary components
const MapComponent = (props) => (<div>This is Map</div>)
const Profile = (props) => (<div>This is Profile</div>)
const Venue = (props) => (<div>This is Venue</div>)
const Favorites = (props) => (<div>This is Favorites</div>)

class Dashboard extends Component {
  state = {
    user: {},
    events: []
  }

  setUser = (user) => {
    this.setState({
      user: user
    })
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
    const { events, user } = this.state
    const { handleLogOut } = this.props
    return(
      <div>
      <NavigationBar handleLogOut={handleLogOut}/>
      <Switch>
        <Route exact path='/' component={MapComponent} />
        <Route path='/profile' component={Profile} />
        <Route path='/venue' component={Venue} />
        <Route path='/favorites' component={Favorites} />

        {/* If none of the routes above was matched redirect to '/' */}
        <Redirect to='/'/>
      </Switch>
      </div>
    )
  }
}

export default Dashboard
