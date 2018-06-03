import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

// Child components
import NavigationBar from './NavigationBar'
import Profile from './Profile'
import EstablishmentProfile from './EstablishmentProfile';
import Welcome from './Welcome'


const SidePanel = ({handleLogOut}) => {
  return(
    <div className='side-panel'>
      <NavigationBar handleLogOut={handleLogOut}/>
      <Switch>
        <Route exact path='/' component={Welcome} />
        <Route path='/profile' component={Profile} />
        <Route path='/establishments/:establishmentId' component={EstablishmentProfile} />

        {/* If none of the routes above was matched redirect to '/' */}
        <Redirect to='/'/>
      </Switch>
    </div>
  )
}

export default SidePanel;