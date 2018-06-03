import React, { Component } from "react";
import { GoogleApiWrapper } from "google-maps-react";
import { FormGroup, FormControl, ControlLabel, Radio, Button} from 'react-bootstrap';

//Component made following https://github.com/fullstackreact/google-maps-react/blob/master/examples/components/autocomplete.js example
class AddressSearchInput extends Component {
  constructor(props) {
    super(props);
    this.textInputRef = null; //Will hold reference to text input HTMLInputElement
  }

  //Grab input ref so that we can build the text input with google
  //autocomplete capabilities as shown in setUpAutoComplete()
  grabInputRef = el => {
    this.textInputRef = el;
  };

  //Not sure how we have google already at this 'early' to me point
  //had to add this not sure exactly why, thought componentDidUpdate
  //would take care but in this use case is not even running
  componentDidMount() {
    this.setUpAutocomplete();
  }

  //Once we receive the google object in the props this method will fire
  //then we want to setUpAutoComplete()
  componentDidUpdate(prevProps) {
    this.setUpAutocomplete();
  }

  setUpAutocomplete = () => {
    const google = this.props.google; 
    /*
      Check if we have the google obj in props which again we don't 
      the fist time around and therefore we dont want to try
      creating an autocomplete object from something that is not 
      there yet 
    */
    if (!google)  {
      return;
    }

    //Else
    const options = {
      types: ['establishment']
    };
    const autocomplete = new google.maps.places.Autocomplete(this.textInputRef, options);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        console.log("Error no place geometry");
      }
      this.props.handleEstablishmentInput(place);
    });
  }

  render() {
    if(!this.props.google) {
      return (<div>Loading....</div>)
    }
    return (
      <input 
        ref={this.grabInputRef}
        required
        className="places-autocomplete"
        type="text"
        placeholder="Establishment Name"
      />
    );
  }
}

const AutocompleteInputText = GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  version: "3.31"
})(AddressSearchInput)

export default AutocompleteInputText;
