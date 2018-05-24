import React, { Component } from 'react';

const styles = {
  border: 'solid black 3px'
}

class AllEvents extends Component {
  constructor(props){
    super(props)
  }

  render(){
    const { events } = this.props
    console.log('this.props.events', events)
    return(
      <div>
        <h3>All Events</h3>
        {
          events.map(event => (
            <div className='tile' style={styles}>
              <div><p>Home Team: {event.homeTeam} </p></div>
              <div><p>Away Team: {event.homeTeam} </p></div>
              <div><p>Date: {event.startTime} </p></div>
            </div>
          ))
        }
      </div>
    )
  }
}

export default AllEvents;