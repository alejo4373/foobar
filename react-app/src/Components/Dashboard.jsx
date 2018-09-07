import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'
import LogInForm from '../Components/UserAuth/LogInForm'
import SignUpForm from '../Components/UserAuth/SignUpForm'

class Dashboard extends Component {
  renderLogInForm = () => {
    return (<LogInForm logInUser={this.props.logInUser} />)
  }

  renderSignUpForm = () => {
    return (<SignUpForm signUpUser={this.props.signUpUser} />)
  }

  renderSidePanel = () => {
    const { logOutUser, logInUser, user } = this.props
    return (
      <SidePanel logOutUser={logOutUser} logInUser={logInUser} user={user} />
    )
  }

  render() {
    return (
      <div className='dashboard'>
        <Switch>
          <Route exact path='/' render={this.renderSidePanel} />
          <Route path='/login' render={this.renderLogInForm} />
          <Route path='/signup' render={this.renderSignUpForm} />
        </Switch>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
