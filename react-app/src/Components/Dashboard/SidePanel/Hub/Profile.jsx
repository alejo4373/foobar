import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import '../../../../Stylesheets/profile.css'

// GraphQL Operations
import { getEstablishmentsUserManages } from '../../../../Queries/API';

// Child components
import EstablishmentList from './SharedComponents/EstablishmentList'
import AddEstablishmentForm from './Profile/AddEstablishmentForm';

// Icons
import ProfileIcon from '../../../../svg/ProfileIcon'
import PlusIcon from '../../../../svg/PlusIcon'

class Profile extends Component {
  state = {
    establishments: []
  }

  componentDidMount() {
    this.fetchEstablishments()
  }

  fetchEstablishments = () => {
    getEstablishmentsUserManages(20, (err, establishments) => {
      if (err) {
        return console.log('error on getManagerEstablishments', err)
      }
      this.setState({
        establishments: establishments
      })
    });
  }

  handleNewEstablishment = (newEst) => {
    this.setState(prevState => ({
      establishments: [...prevState.establishments, newEst]
    }))
  }

  renderAddEstablishmentForm = () => {
    return <AddEstablishmentForm handleNewEstablishment={this.handleNewEstablishment} />
  }

  render() {
    console.log('Profile render')
    const { user } = this.props;
    const { establishments } = this.state;
    return (
      <div className='profile'>
        <div className='top'>
          <ProfileIcon />
        </div>
        <div className='middle'>
          <div className='button'>
            <Link to='/profile/addestablishment'>
              <div className='add-establishment'>
                <PlusIcon />
              </div>
              <p>Add Establishment</p>
            </Link>
          </div>
          <h3>{user.username}</h3>
          <p>{user.email}</p>
        </div>
        <div className='bottom'>
          <Route exact path='/profile/addestablishment' render={this.renderAddEstablishmentForm} />
          <EstablishmentList establishments={establishments} />
        </div>
      </div>
    )
  }
}

export default Profile;
