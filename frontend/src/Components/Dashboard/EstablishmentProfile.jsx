import React, { Component } from 'react';
import AddEventForm from './Establishments/AddEventForm';

import { getEvents, getEstablishmentById } from '../../Queries/API';

//Child components
import EventList from './EventList';

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

  render() {
    const { establishmentId } = this.props.match.params;
    const { events } = this.state;
    return(
      <div>
        <h3> Establishment Profile</h3>
        <EventList events={events}/>
        <AddEventForm establishmentId={establishmentId}/>
        
      </div>
    )
  }
}

export default EstablishmentProfile;