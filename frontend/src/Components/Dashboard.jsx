import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

//Amplify 
import { API, graphqlOperation } from 'aws-amplify'

//GraphQL operations
import GetAllEvents from "../Queries/GetAllEvents";

//Child Components
import NavigationBar from './Dashboard/NavigationBar'
import MapComponent from './Dashboard/MapComponent'
import Profile from './Dashboard/Profile'
import Establishments from './Dashboard/Establishments'

//Temporary components
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

  // componentDidMount() {
  //   this.getData()
  // }

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
        <Route path='/establishments' component={Establishments} />
        <Route path='/favorites' component={Favorites} />

        {/* If none of the routes above was matched redirect to '/' */}
        <Redirect to='/'/>
      </Switch>
      </div>
    )
  }
}

export default Dashboard
