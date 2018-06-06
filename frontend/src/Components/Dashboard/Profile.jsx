import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import '../../Stylesheets/profile.css'

//GraphQL Operations
import { getEstablishmentsUserManages } from '../../Queries/API';

// Child components
import EstablishmentList from './Profile/EstablishmentList';
import ProfileIcon from '../../svg/ProfileIcon'
import PlusIcon from '../../svg/PlusIcon'
import AddEstablishmentForm from './Profile/AddEstablishmentForm';
import Switch from 'react-router-dom/Switch';

class Profile extends Component {
  state = {
    establishments: []
  }

  componentDidMount() {
    getEstablishmentsUserManages(20, (err, establishments) => {
      if(err) {
        return console.log('error on getManagerEstablishments', err)
      }
      this.setState({
        establishments: establishments  
      })
    });
  }

  render() {
    const { user } = this.props;
    const { establishments } = this.state;
    return (
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
          <Route exact path='/profile/addestablishment' component={AddEstablishmentForm}/>
          <EstablishmentList establishments={establishments}/>
          </div>
      </div>
    )
  }
}

export default Profile;