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

  handleSubmit = async (e) => {
    const { searchStr } = this.state;
    e.preventDefault()
    console.log(e)
    console.log('searching for event or establishemt')
    try {
      let results = await searchEstablishments(searchStr);
      this.props.setSearchResults(results)
    }
    catch (err) {
      return console.log('err in searchEstablishments', err)
    }
  }

  renderButtonIcon = () => {
    const { searchBarFocussed } = this.state;
    const { goBack, pathname } = this.props;
    if (searchBarFocussed || pathname === '/') {
      return (
        <button className='button-icon-container' onClick={this.handleSubmit} >
          <SearchIcon />
        </button>
      )
    } else {
      return (
        <button className='button-icon-container' onClick={goBack} >
          <BackIcon />
        </button>
      )
    }
  }

  render() {
    const { user } = this.props
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
                <Link
                  to='/'
                  onClick={handleLogOutClick} >
                  <LogoutIcon />
                </Link>
              </div>
            )
        }
      </div>
    )
  }
}

export default NavigationBar;
