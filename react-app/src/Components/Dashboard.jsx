import React, { Component } from 'react';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'

const Dashboard = (props) => {
    return (
      <div className='dashboard'>
        <SidePanel {...props} />
        <MapComponent />
      </div>
    )
}

export default Dashboard
