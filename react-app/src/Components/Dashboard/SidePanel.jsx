import React from 'react';
import { Route, Switch } from 'react-router-dom';

// Child components
import Hub from './SidePanel/Hub'
import UserAuth from './SidePanel/UserAuth'

const SidePanel = ({ user, message, signUpUser, logInUser, logOutUser }) => {
  const renderHub = (routeProps) => {
    const { goBack } = routeProps.history;
    const { pathname } = routeProps.location
    return <Hub logOutUser={logOutUser} user={user} goBack={goBack} pathname={pathname} />
  }

  const renderUserAuth = () => {
    return <UserAuth user={user} message={message} signUpUser={signUpUser} logInUser={logInUser} />
  }

  return (
    <Switch>
      <Route path='/(login|signup|confirm)' render={renderUserAuth} />
      <Route path='/' render={renderHub} />
    </Switch>
  )
}

export default SidePanel;