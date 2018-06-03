import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

// Child components
import NavigationBar from './NavigationBar'
import Profile from './Profile'
import EstablishmentProfile from './EstablishmentProfile';
import Welcome from './Welcome'


const SidePanel = ({handleLogOut, user}) => {
  const renderProfileWithProps = () => (
    <Profile user={user} />
  )

  return(
    <div className='side-panel'>
      <NavigationBar handleLogOut={handleLogOut}/>
      <div className='content'>
        <Switch>
          <Route exact path='/' component={Welcome} />
          <Route path='/profile' render={renderProfileWithProps} />
          <Route path='/establishments/:establishmentId' component={EstablishmentProfile} />

          {/* If none of the routes above was matched redirect to '/' */}
          <Redirect to='/'/>
        </Switch>
      </div>
    </div>
  )
}

export default SidePanel;