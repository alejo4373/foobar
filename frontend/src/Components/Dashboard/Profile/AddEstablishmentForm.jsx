import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button} from 'react-bootstrap';


//Child Components
import AutocompleteEstablishmenInput from './AutocompletEstablishmentInput';

import { addEstablishment } from '../../../Queries/API'

class AddEstablishmentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {} //Will hold establishments properties
  }

  handleEstablishmentInput = (place) => {
    const googlePhotoUrl = place.photos[0].getUrl({maxWidth: 400, maxHeight: 400}) || 'https://images.pexels.com/photos/681847/pexels-photo-681847.jpeg?dl&fit=crop&crop=entropy&w=400&h='

    const placeInfo = {
      googlePlaceId: place.place_id,
      googlePhotoUrl: googlePhotoUrl,
      name: place.name.toLowerCase(), 
      displayName: place.name, 
      address: place.formatted_address,
      phone: place.formatted_phone_number,
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
      console.log('success in addEstablishment:', data)
    });
  }

  render() {
    const { username, password, email } = this.state
    return (
      <div>
        <h3>Add Establishment</h3>
        <form onSubmit={this.handleSubmit}>
          <AutocompleteEstablishmenInput handleEstablishmentInput={this.handleEstablishmentInput}/>
          <Button type='submit' value='Submit'>Add</Button>
        </form>
      </div>
    )
  }
}

export default AddEstablishmentForm