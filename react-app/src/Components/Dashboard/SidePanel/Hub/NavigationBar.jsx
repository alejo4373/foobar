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
    searchStr: '',
    searchBarFocussed: false
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

  handleInputFocus = () => {
    console.log('handleInputFocus')
    this.setState(prevState => {
      return {
        searchBarFocussed: !prevState.searchBarFocussed
      }
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

  renderButtonIcon = () => {
    const { searchBarFocussed } = this.state;
    const { goBack, pathname } = this.props;
    if (searchBarFocussed || pathname === '/') {
      return (
        <button className='back-icon-container' onClick={this.handleSubmit} >
          <SearchIcon />
        </button>
      )
    } else {
      return (
        <button className='back-icon-container' onClick={goBack} >
          <BackIcon />
        </button>
      )
    }
  }

  render() {
    const { user, goBack } = this.props
    const { handleLogOutClick, handleSubmit, setSearchStr, handleInputFocus } = this
    return (
      <div className='navigation-bar'>
        {this.renderButtonIcon()}
        <div className='searchbox'>
          <form onSubmit={handleSubmit}>
            <SearchBox setSearchStr={setSearchStr} handleInputFocus={handleInputFocus} />
            <input className='hide' type='submit' />
          </form>
        </div>

        <div className='separator' />
        {
          //If user is guest
          !user.username ? (
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