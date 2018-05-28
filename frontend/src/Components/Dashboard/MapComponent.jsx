import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import '../../Stylesheets/map.css';

import { API, graphqlOperation } from 'aws-amplify';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientLocation: {} 
    }
    //At the moment of instantiation we try to get client location
    //this.tryGetClientLocation()
  }

  componentDidMount() {
    this.tryGetClientLocation()
  }

  tryGetClientLocation = () => {
    const onSuccess = position => {
        this.setState({
          clientLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        })
    }
    const onError = err => {
      return console.log('Error getting client location', err)
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError)
  }

  //Though trial an error discovered that the most convenient
  //event to grab the bounds of the map was tiles_loader
  //as it gets fired once the map loads and drag event ends.
  //I tried onReady but in the first render bounds were not available
  //and tried onBounds_changed but fired in the middle of a drag event and very often
  handleTilesLoaded = (mapProps, map) => {
    console.log('tiles loaded ===>')
    const zoom = map.zoom;
    const bounds = map.getBounds()
    const areaBounds = {
      latMax: bounds.f.f,
      latMin: bounds.f.b,
      lngMax: bounds.b.b,
      lngMin: bounds.b.f
    }
    console.log('boundsArea', areaBounds)
    console.log('zoom', zoom)
    if(zoom < 13) {

    }

  }

  render() {
    const { clientLocation } = this.state
    return(
      <div className='map-container'>
        <Map 
          google={this.props.google} 
          zoom={14}
          onTilesloaded={this.handleTilesLoaded}
          center={clientLocation}
          containerStyle={{height: 'inherit'}}
          >
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(MapComponent);