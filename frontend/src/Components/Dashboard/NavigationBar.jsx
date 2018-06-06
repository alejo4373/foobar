import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import '../../Stylesheets/navigation-bar.css'

// Child Components
import SearchBox from './SearchBox';

// Svg icons
import LogoutIcon from "../../svg/LogoutIcon";
import LoginIcon from "../../svg/LoginIcon";
import ProfileIcon from "../../svg/ProfileIcon";
import SearchIcon from '../../svg/SearchIcon';

const NavigationBar = (props) => {
  const handleLogOut = () => {
    Auth.signOut()
        .then(() => {
          props.handleLogOut();
        })
        .catch(err => console.log('logged out err', err))
  }

  return(
      <div className='navigation-bar'>
        <div className='searchbox'>
          <SearchIcon/>
          <SearchBox/>
        </div>
        <div className='separator'/>
        <div className='links-box'>
          <Link to='/profile'>
            <ProfileIcon/>
          </Link>
          <a 
            href='#logout'
            onClick={handleLogOut} >
            {/* <LogoutIcon/> */}
            <LoginIcon/>
          </a>
        </div>
      </div>
  )
} 

export default NavigationBar;