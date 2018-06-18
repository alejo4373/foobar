import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button} from 'react-bootstrap';

import '../../../Stylesheets/add-establishment.css'
//Child Components
import AutocompleteEstablishmentInput from './AutocompleteEstablishmentInput';
import SearchIcon from '../../../svg/SearchIcon';

import { addEstablishment } from '../../../Queries/API'
import PlusIcon from '../../../svg/PlusIcon';

class AddEstablishmentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {} //Will hold establishments properties
  }

  handleEstablishmentInput = (place) => {
    const googlePhotoUrl = place.photos[0].getUrl({maxWidth: 500, maxHeight: 500}) || 'https://images.pexels.com/photos/681847/pexels-photo-681847.jpeg?dl&fit=crop&crop=entropy&w=400&h='

    const placeInfo = {
      googlePlaceId: place.place_id,
      googlePhotoUrl: googlePhotoUrl,
      name: place.name.toLowerCase(), 
      displayName: place.name, 
      address: place.formatted_address,
      phone: place.formatted_phone_number || 'none',
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
    this.setState(placeInfo)
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const newEstablishment = this.state
    addEstablishment(newEstablishment, (err, data) => {
      if(err) {
        return console.log('error in addEstablishment:', err)
      }
      this.props.handleNewEstablishment(data)
      console.log('success in addEstablishment:', data)
    });
  }

  render() {
    const { username, password, email } = this.state
    return (
      <div className='add-establishment'>
        <h4>Add Establishment</h4>
        <div className='form-box'>
          <SearchIcon/>
          <form onSubmit={this.handleSubmit}>
              <AutocompleteEstablishmentInput handleEstablishmentInput={this.handleEstablishmentInput}/>
              <button type='submit'>
                <PlusIcon />
              </button>
          </form>
        </div>
      </div>
    )
  }
}

export default AddEstablishmentForm