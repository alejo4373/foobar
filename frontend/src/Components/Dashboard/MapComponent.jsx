import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { Link } from 'react-router-dom';

import '../../Stylesheets/map.css';
import { getEstablishmentsInBounds } from '../../Queries/API';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientLocation: {},
      establishments: [],

      showInfoWindow: false,
      activeMarker: {},
      selectedPlace: {}
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
      getEstablishmentsInBounds(areaBounds, (err, establishments) => {
        if(err) {
          return console.log('error getEstablishmentsInBounds:', err)
        }
        this.setState({
          establishments: establishments
        })
      })
    }
  }

  onMakerClick = (props, marker, e) => {
    console.log('on pin click')
    console.log(props)
    console.log(marker)
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showInfoWindow: true
    })
  }

  render() {
    const { clientLocation, establishments, activeMarker, showInfoWindow, selectedPlace  } = this.state
    return(
      <div className='map-container'>
        <Map 
          google={this.props.google} 
          zoom={14}
          style={{width: 'inherit'}}
          onTilesloaded={this.handleTilesLoaded}
          center={clientLocation}
          containerStyle={{width: 'inherit', position: 'relative'}}
        >{
          establishments.map((est, i) => (
              <Marker
                key={i}
                title={est.displayName}
                estDisplayName={est.displayName}
                estImage={est.googlePhotoUrl}
                estId={est.id}
                estPhone={est.phone}
                position={{lat: est.lat, lng: est.lng}}
                onClick={this.onMakerClick}
              />
          ))
        }
        <InfoWindow marker={activeMarker} visible={showInfoWindow} >
          <a href={`/establishments/${selectedPlace.estId}`} >
            <div 
              className='establishment-card'
              to={`/establishments/${selectedPlace.estId}`}
            >
              <div className='left' style={{backgroundImage: `url(${selectedPlace.estImage})`}}>
              </div>
              <div className='right'>
                <p className='name'>{selectedPlace.estDisplayName}</p> 
                <p>{selectedPlace.estPhone}</p>
              </div> 
            </div>
          </a>
        </InfoWindow>
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
})(MapComponent);