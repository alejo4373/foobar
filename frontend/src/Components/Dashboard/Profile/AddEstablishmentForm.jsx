import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button} from 'react-bootstrap';

import { Auth, API, graphqlOperation } from 'aws-amplify';

//GraphQL operations
import AddEstablishment from '../../../Queries/AddEstablishment'

//Child Components
import AutocompleteEstablishmenInput from './AutocompletEstablishmentInput';

class AddEstablishmentForm extends Component {
  constructor(props) {
    super(props)
    this.state = {} //Will hold establishments properties
  }

  async addEstablishment() {
    const establishmentsDetails = this.state
    try {
      const res = await API.graphql(graphqlOperation(AddEstablishment, establishmentsDetails));
      console.log('addEstablishment res ===>', res)
    } catch(err) {
      console.log('addEstablishment err ===>', err)
    }
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
    this.addEstablishment();
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