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
    //If place doesn't have a name, [we do not want that] place.name will be set to the part before the fist comma
    //and we do not want a full address with repeated info so here we check and adjust 
    const fullAddress = place.formatted_address.split(',')[0] === place.name 
                        ? place.formatted_address 
                        : place.name + ', ' + place.formatted_address
    const placeInfo = {
      googlePlaceId: place.place_id,
      name: place.name, 
      address: fullAddress,
      phone: place.formatted_phone_number,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
    console.log('place', place)
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