import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'
import LogInForm from '../Components/UserAuth/LogInForm'

class Dashboard extends Component {
  renderLogInForm = () => {
    return(<LogInForm logInUser={this.props.logInUser}/>)
  }

  renderSidePanel = () => {
    const { logOutUser, logInUser, user } = this.props
    return(
      <SidePanel logOutUser={logOutUser} logInUser={logInUser} user={user}/>
    )
  }

  render() {
    return(
      <div className='dashboard'>
        <Switch>
          <Route exact path='/' render={this.renderSidePanel} />
          <Route path='/login' render={this.renderLogInForm} />
        </Switch>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
