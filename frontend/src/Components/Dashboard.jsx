import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

//Child Components
import NavigationBar from './Dashboard/NavigationBar'
import MapComponent from './Dashboard/MapComponent'
import Profile from './Dashboard/Profile'
import EstablishmentProfile from './Dashboard/EstablishmentProfile';

//Temporary components
const Favorites = (props) => (<div>This is Favorites</div>)

class Dashboard extends Component {
  state = {
    user: {},
  }

  setUser = (user) => {
    this.setState({
      user: user
    })
  }


  render() {
    console.log(this.state)
    const { user } = this.state
    const { handleLogOut } = this.props
    return(
      <div>
      <NavigationBar handleLogOut={handleLogOut}/>
      <Switch>
        <Route exact path='/' component={MapComponent} />
        {/* <Route exact path='/' render={() => <div>Map</div>} /> */}
        <Route path='/profile' component={Profile} />
        <Route path='/establishments/:establishmentId' component={EstablishmentProfile} />
        <Route path='/favorites' component={Favorites} />

        {/* If none of the routes above was matched redirect to '/' */}
        <Redirect to='/'/>
      </Switch>
      </div>
    )
  }
}

export default Dashboard
