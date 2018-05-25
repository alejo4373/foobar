import React, { Component } from 'react';
import LogInForm from './UserAuth/LogInForm';
import SignUpForm from './UserAuth/SignUpForm';
import { Switch, Route, Redirect } from 'react-router-dom';
import '../Stylesheets/userAuth.css'

const UserAuth = (props) => {
  const renderLogInForm = () => {
    const { handleLogInSuccess } = props
    return(<LogInForm handleLogInSuccess={handleLogInSuccess}/>)
  }

  return(
    <div className='form-container'>
      <Switch>
        <Route exact path='/' render={() => <Redirect to='/login'/>}/>
        <Route path='/login' render={renderLogInForm}/>
        <Route path='/signup' component={SignUpForm}/>
      </Switch>
    </div>
  )
}

export default UserAuth