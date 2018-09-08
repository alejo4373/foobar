import React from 'react';
import { Route, Switch } from 'react-router-dom';

// Child components
import Hub from './SidePanel/Hub'
import UserAuth from './SidePanel/UserAuth'

const SidePanel = ({ user, message, signUpUser, logInUser, logOutUser }) => {
  const renderHub = () => {
    return <Hub logOutUser={logOutUser} user={user} />
  }

  const renderUserAuth = () => {
    return <UserAuth message={message} signUpUser={signUpUser} logInUser={logInUser} />
  }

  return (
    <Switch>
      <Route exact path='/' render={renderHub} />
      <Route path='/(|login|signup|confirm)' render={renderUserAuth} />
    </Switch>
  )
}

export default SidePanel;