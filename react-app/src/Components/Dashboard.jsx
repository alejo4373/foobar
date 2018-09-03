import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'

class Dashboard extends Component {
  render() {
    const { logOutUser, logInUser } = this.props
    const { user } = this.props
    return(
      <div className='dashboard'>
        <SidePanel logOutUser={logOutUser} logInUser={logInUser} user={user}/>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
