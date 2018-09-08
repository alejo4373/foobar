import React, { Component } from 'react';
import LogInForm from './UserAuth/LogInForm';
import SignUpForm from './UserAuth/SignUpForm';
import ConfirmSignUp from './UserAuth/ConfirmSignUp';

import { Switch, Route } from 'react-router-dom';

const UserAuth = ({ message, signUpUser, logInUser }) => {
  const renderLogInForm = (routeProps) => {
    const { state } = routeProps.location;
    let signUpConfirmed = null;
    if (state) { signUpConfirmed = state.signUpConfirmed }
    return (<LogInForm logInUser={logInUser} signUpConfirmed={signUpConfirmed} />)
  }

  const renderSignUpForm = () => {
    return (<SignUpForm signUpUser={signUpUser} message={message} />)
  }

  const renderConfirmSignUp = (routeProps) => {
    const { state } = routeProps.location;
    let username = '';
    if (state) { username = state.username }
    return (<ConfirmSignUp username={username}/>)
  }

  return(
    <div className='user-auth'>
        <Switch>
          <Route path='/login' render={renderLogInForm} />
          <Route path='/signup' render={renderSignUpForm} />
          <Route path='/confirm' render={renderConfirmSignUp} />
        </Switch>
    </div>
  )
}

export default UserAuth