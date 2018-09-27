import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

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
    if (zoom >= 14) {
      getEstablishmentsInBounds(areaBounds, (err, establishments) => {
        if (err) {
          return console.log('error getEstablishmentsInBounds:', err)
        }
        this.setState({
          establishments: establishments
        })
      })
    }
  }

  handleMapReady = (mapProps, map) => {
    let { google } = mapProps;
    // Create PlacesService to retrieve images src from google
    this.placesService = new google.maps.places.PlacesService(map);
  }

  onMakerClick = (props, marker, e) => {
    const { establishment } = props

    // Get the photo url for the active marker from google. This sucks, google won't allow me to store 
    // urls to their images in my database.
    this.placesService.getDetails({
      placeId: establishment.googlePlaceId,
      fields: ['photo']
    }, (place, status) => {
      if (status === 'OK') {
        establishment.googlePhotoUrl = place.photos[0].getUrl({ maxWidth: 500, maxHeight: 500 });
      } else {
        establishment.googlePhotoUrl = 'https://images.pexels.com/photos/681847/pexels-photo-681847.jpeg?dl&fit=crop&crop=entropy&w=400&h='
      }

      this.setState({
        selectedPlace: establishment,
        activeMarker: marker,
        showInfoWindow: true
      })
    })
  }

  render() {
    const { clientLocation, establishments, activeMarker, showInfoWindow, selectedPlace } = this.state
    return (
      <div className='map-container'>
        <Map
          google={this.props.google}
          zoom={14}
          style={{ width: 'inherit' }}
          onReady={this.handleMapReady}
          onTilesloaded={this.handleTilesLoaded}
          center={clientLocation}
          containerStyle={{ width: 'inherit', position: 'relative' }}
        >
          <Marker
            title='You'
            position={clientLocation}
            icon={{
              url: "http://i.stack.imgur.com/orZ4x.png",
              scaledSize: new this.props.google.maps.Size(22, 22)
            }}
          />

          {
            establishments.map((est, i) => (
              <Marker
                key={i}
                establishment={est}
                position={{ lat: est.lat, lng: est.lng }}
                onClick={this.onMakerClick}
              />
            ))
          }
          <InfoWindow marker={activeMarker} visible={showInfoWindow} >
            <a href={`/establishments/${selectedPlace.id}`} >
              <div
                className='establishment-card'
                to={`/establishments/${selectedPlace.id}`}
              >
                <div className='left' style={{ backgroundImage: `url(${selectedPlace.googlePhotoUrl})` }}>
                </div>
                <div className='right'>
                  <p className='name'>{selectedPlace.displayName}</p>
                  <p>{selectedPlace.phone}</p>
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