import React, { Component } from 'react';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'

class Dashboard extends Component {
  render() {
    const { handleLogOut } = this.props
    return(
      <div className='dashboard'>
        <SidePanel handleLogOut={handleLogOut}/>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
