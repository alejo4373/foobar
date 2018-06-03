import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../../Stylesheets/profile.css'

// Child components
import EstablishmentList from './Profile/EstablishmentList';
import ProfileIcon from '../../svg/ProfileIcon'
import PlusIcon from '../../svg/PlusIcon'

const Profile = ({user}) => (
  <div className='profile'>
      <div className='top'>
        <ProfileIcon/>
      </div>
      <div className='middle'>
        <Link to='/profile/addestablishment'>
          <div className='button'>
            <div className='add-establishment'>
              <PlusIcon/>
            </div>
            <p>Add Establishment</p>
          </div>
        </Link>
          <h3>{user.username}</h3>
          <p>{user.email}</p>
        </div>
      <div className='bottom'>
        <EstablishmentList />
      </div>
  </div>
)

export default Profile;