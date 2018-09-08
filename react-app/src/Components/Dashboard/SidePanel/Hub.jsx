import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

// Child components
import NavigationBar from './Hub/NavigationBar'
import Welcome from './Hub/Welcome'
import Search from './Hub/Search'
import Profile from './Hub/Profile'
import EstablishmentProfile from './Hub/EstablishmentProfile';


class Hub extends Component {
  state = {
    searchResults: [],
  }

  setSearchResults = (results) => {
    this.setState({
      searchResults: results
    })
  }

  renderProfileWithProps = () => (
    <Profile user={this.props.user} />
  )

  renderWelcomeOrSearchResults = () => {
    const { searchResults } = this.state
    if(searchResults.length) {
     return <Search searchResults={searchResults} />
    }
    return <Welcome/>
  }
  
  render () {
    const { logOutUser, user } = this.props
    const { renderProfileWithProps, setSearchResults, renderWelcomeOrSearchResults, renderLogInForm} = this
    const { searchResults } = this.state
    return(
      <div className='side-panel'>
        <NavigationBar
          logOutUser={logOutUser}
          user={user}
          setSearchResults={setSearchResults}
        />
        <div className='content'>
          <Switch>
            <Route exact path='/' render={renderWelcomeOrSearchResults} />
            <Route path='/profile' render={renderProfileWithProps} />
            <Route path='/establishments/:establishmentId' component={EstablishmentProfile} />

            {/* If none of the routes above was matched redirect to '/' */}
            <Redirect to='/'/>
          </Switch>
        </div>
      </div>
    )
  }
}

export default Hub;