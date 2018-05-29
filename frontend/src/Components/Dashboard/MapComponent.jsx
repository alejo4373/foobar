import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import '../../Stylesheets/map.css';
import { fetchEstablishmentsInBounds } from '../../Queries/API';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientLocation: {},
      establishments: [] 
    }
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

  //Through trial an error discovered that the most convenient
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
    if(zoom >= 14) {
      fetchEstablishmentsInBounds(areaBounds, (err, establishments) => {
        if(err) {
          return console.log('error fetchEstablishmentsInBounds:', err)
        }
        this.setState({
          establishments: establishments
        })
      })
    }
  }

  render() {
    const { clientLocation, establishments  } = this.state
    return(
      <div className='map-container'>
        <Map 
          google={this.props.google} 
          zoom={14}
          onTilesloaded={this.handleTilesLoaded}
          center={clientLocation}
          containerStyle={{height: 'inherit'}}
        >{
          establishments.map(est => (
            <Marker
              title={est.name}
              name={est.name}
              position={{lat: est.lat, lng: est.lng}}
            />
          ))
        }
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(MapComponent);