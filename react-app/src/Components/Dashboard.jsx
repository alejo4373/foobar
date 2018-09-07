import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import '../Stylesheets/dashboard.css'

// Child Components
import MapComponent from './Dashboard/MapComponent'
import SidePanel from './Dashboard/SidePanel'
import LogInForm from './UserAuth/LogInForm'
import SignUpForm from './UserAuth/SignUpForm'
import ConfirmSignUp from './UserAuth/ConfirmSignUp';

class Dashboard extends Component {
  renderLogInForm = (routeProps) => {
    const { state } = routeProps.location;
    let signUpConfirmed = null;
    if (state) { signUpConfirmed = state.signUpConfirmed }
    return (<LogInForm logInUser={this.props.logInUser} signUpConfirmed={signUpConfirmed} />)
  }

  renderSignUpForm = () => {
    const { message } = this.props
    return (<SignUpForm signUpUser={this.props.signUpUser} message={message} />)
  }

  renderConfirmSignUp = (routeProps) => {
    const { state } = routeProps.location;
    let username = '';
    if (state) { username = state.username }
    return (<ConfirmSignUp username={username}/>)
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
          <Route path='/login' render={this.renderLogInForm} />
          <Route path='/signup' render={this.renderSignUpForm} />
          <Route path='/confirm' render={this.renderConfirmSignUp} />
          <Route path='/' render={this.renderSidePanel} />
        </Switch>
        <MapComponent />
      </div>
    )
  }
}

export default Dashboard
