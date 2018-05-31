import React, { Component } from 'react';
import AddEstablishmentForm from './Profile/AddEstablishmentForm';
import EstablishmentList from './Profile/EstablishmentList';
import { Switch, Route, Link } from 'react-router-dom';

class Profile extends Component {
  render() {
    return (
      <div>
        <h3>Profile</h3>
          <AddEstablishmentForm/>
          <EstablishmentList />
      </div>
    )
  }
}

export default Profile;