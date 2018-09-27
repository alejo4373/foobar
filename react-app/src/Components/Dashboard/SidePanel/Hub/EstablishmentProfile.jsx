import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import { getEvents, getEstablishmentById } from '../../../../Queries/API';
import '../../../../Stylesheets/establishmentProfile.css'

//Child components
import EventList from './EstablishmentProfile/EventList';
import AddEventForm from './EstablishmentProfile/AddEventForm';
import PlusIcon from '../../../../svg/PlusIcon';



class EstablishmentProfile extends Component {
  constructor(props) {
    super(props) 
    this.state = {
      establishment: {},
      events: []
    }
  }
  componentDidMount() {
    this.fetchEvents()
    this.fetchEstablishmentInfo()
  }

  fetchEstablishmentInfo = () => {
    const { establishmentId } = this.props.match.params
    getEstablishmentById(establishmentId, (err, establishment) => {
      if(err) {
        return console.log('err in getEstablishmentById():', err)
      }
      this.setState({
        establishment: establishment
      })
    })
  }

  fetchEvents = () => {
    const { establishmentId } = this.props.match.params
    getEvents(establishmentId, (err, events) => {
      if(err) {
        return console.log('err in getEvents():', err)
      }
      this.setState({
        events: events
      })
    })
  }

  handleAddedEvent = (event) => {
    this.setState(prevState => ({
      events: [...prevState.events, event]
    }))
  }

  //Renderers
  renderAddEventForm = () => {
    const { establishmentId } = this.props.match.params
    return(
      <AddEventForm
        establishmentId={establishmentId}
        handleAddedEvent={this.handleAddedEvent}
      />
    )
  }

  render() {
    const { events, establishment } = this.state;
    console.log('this.props.match.url',this.props.match.url)
    return(
      <div className='establishment-profile'>
        <div className='top'>
          <img 
            className='establishment-photo'
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${establishment.googlePhotoUrl}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
            alt='bar or restaurant'
          />
        </div>
        <div className='middle'>
          <Link to={`${this.props.match.url}/addEvent`}>
            <div className='button'>
              <div className='add-event'>
                <PlusIcon/>
              </div>
              <p>Add Event</p>
            </div>
          </Link>
          <h3>{establishment.displayName}</h3>
          <p>{establishment.address}</p>
          <p>{establishment.phone}</p>
        </div>
        <div className='bottom'>
          <Route path={`${this.props.match.url}/addevent`} render={this.renderAddEventForm} />
          <EventList events={events}/>
        </div>
        
      </div>
    )
  }
}

export default EstablishmentProfile;