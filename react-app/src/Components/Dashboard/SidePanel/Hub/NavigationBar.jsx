import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../../../../Stylesheets/navigation-bar.css'

import { searchEstablishments } from '../../../../Queries/API'
// Child Components
import SearchBox from './NavigationBar/SearchBox';

// Svg icons
import LogoutIcon from "../../../../svg/LogoutIcon";
import LoginIcon from "../../../../svg/LoginIcon";
import ProfileIcon from "../../../../svg/ProfileIcon";
import SearchIcon from '../../../../svg/SearchIcon';
import BackIcon from '../../../../svg/BackIcon';

class NavigationBar extends Component {
  state = {
    searchStr: ''
  }

  handleLogOutClick = (e) => {
    e.preventDefault();
    this.props.logOutUser();
  }

  setSearchStr = (str) => {
    this.setState({
      searchStr: str
    })
  }

  handleSubmit = (e) => {
    const { searchStr } = this.state;
    e.preventDefault()
    console.log(e)
    console.log('searching for event or establishemt')
    searchEstablishments(searchStr, (err, results) => {
      if (err) {
        return console.log('err in searchEstablishments', err)
      }
      this.props.setSearchResults(results)
    })
  }

  render() {
    const { user, goBack } = this.props
    const { handleLogOutClick, handleSubmit, setSearchStr } = this
    return (
      <div className='navigation-bar'>
        <div className='back-icon-container' onClick={goBack} >
          <BackIcon />
        </div>
        <SearchIcon />
        <div className='searchbox'>
          <form onSubmit={handleSubmit}>
            <SearchBox setSearchStr={setSearchStr} />
            <input className='hide' type='submit' />
          </form>
        </div>

        <div className='separator' />
        {
          //If user is guest
          !user ? (
            <div className='links-box no-grid'>
              <Link
                to='/login'
                title='Login as a business manager'
              >
                <LoginIcon />
              </Link>
            </div>
          ) : (
              <div className='links-box two-grid'>
                <Link to='/profile' title='profile'>
                  <ProfileIcon />
                </Link>
                <a
                  href='/logout'
                  title='logout'
                  onClick={handleLogOutClick} >
                  <LogoutIcon />
                </a>
              </div>
            )
        }
      </div>
    )
  }
}

export default NavigationBar;