import React, { Component } from 'react';
import { Navbar, Nav, NavItem, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { Auth } from 'aws-amplify';

const NavigationBar = (props) => {
  const handleLogOut = () => {
    Auth.signOut()
        .then(() => {
          props.handleLogOut();
        })
        .catch(err => console.log('logged out err', err))
  }

  return(
    <Navbar>
      <Nav>
        <NavItem eventKey={2}>
          <Link to='/profile'>Profile</Link>
        </NavItem>
        <NavItem eventKey={3}>
          <Link to='/favorites'>Favorites</Link>
        </NavItem>   
        <NavItem eventKey={4}>
          <Link to='/venue'>Venue</Link>
        </NavItem>   
        <NavItem eventKey={4} onClick={handleLogOut}>Log Out </NavItem>  
      </Nav>
    </Navbar>
  )
} 

export default NavigationBar;