import React, { Component } from 'react';
import LogInForm from './UserAuth/LogInForm';
import SignUpForm from './UserAuth/SignUpForm';
import { Switch, Route, Redirect } from 'react-router-dom';
import '../Stylesheets/userAuth.css'

const UserAuth = ({ logInUser }) => {
  const renderLogInForm = () => {
    return(<LogInForm logInUser={logInUser}/>)
  }

  return(
    <div className='form-container'>
      <Switch>
        <Route path='/login' render={renderLogInForm}/>
        <Route path='/signup' component={SignUpForm}/>
        {/* removed because when I click on <a> in the map i want to be taken to the particular establishment <Redirect to= '/login'/> */}
      </Switch>
    </div>
  )
}

export default UserAuth