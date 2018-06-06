import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'

class Dashboard extends Component {
  state = {
    user: {}
  }

  async getUserAttributes() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      this.setState({
        user: { username: user.username, ...user.attributes }
      })
    } catch(err) {
      console.log('err in Auth.currentAuthenticatedUser()', err)
    }
  }

  componentDidMount(){
    this.getUserAttributes();
  } 
  render() {
    const { logOutUser } = this.props
    const { user } = this.state
    return(
      <div className='dashboard'>
        <SidePanel logOutUser={logOutUser} user={user}/>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
