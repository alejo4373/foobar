import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

// Child components
import NavigationBar from './Hub/NavigationBar'
import Welcome from './Hub/Welcome'
import Search from './Hub/Search'
import Profile from './Hub/Profile'
import EstablishmentProfile from './Hub/EstablishmentProfile';
import UserContext from '../../../contexts/user-context';

class Hub extends Component {
  state = {
    searchResults: [],
  }

  setSearchResults = (results) => {
    this.setState({
      searchResults: results
    })
  }

  handleProfileRoute = () => (
    <UserContext.Consumer>
      {({ user, fetchingUser }) => {
        if (fetchingUser) { return <div>...Loading</div> }
        if (!user) { return <Redirect to='/' /> };
        return (<Profile user={user} />)
      }}
    </UserContext.Consumer>
  )

  renderWelcomeOrSearchResults = () => {
    const { searchResults } = this.state
    if (searchResults.length) {
      return <Search searchResults={searchResults} />
    }
    return <Welcome />
  }

  render() {
    const { logOutUser, user, goBack, pathname } = this.props
    const { handleProfileRoute, setSearchResults, renderWelcomeOrSearchResults } = this
    return (
      <div className='side-panel'>
        <NavigationBar
          logOutUser={logOutUser}
          user={user}
          setSearchResults={setSearchResults}
          goBack={goBack}
          pathname={pathname}
        />
        <div className='content'>
          <Switch>
            <Route path='/profile' render={handleProfileRoute} />
            <Route path='/establishments/:establishmentId' component={EstablishmentProfile} />
            <Route path='/' render={renderWelcomeOrSearchResults} />
            {/* If none of the routes above was matched redirect to '/' */}
            <Redirect to='/' />
          </Switch>
        </div>
      </div>
    )
  }
}

export default Hub;