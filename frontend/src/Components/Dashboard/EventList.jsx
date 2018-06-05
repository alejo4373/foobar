import React from 'react';
import '../../Stylesheets/event-list.css'

const imagesSources = {
  //LeagueId: Url
  4380: 'https://www.thesportsdb.com/images/media/league/badge/small/vxwtqq1421413200.png', //NHL
  4391: 'https://www.thesportsdb.com/images/media/league/badge/small/trppxv1421413032.png', //NFL
  4387: 'https://www.thesportsdb.com/images/media/league/badge/small/rwpxsw1421413099.png', //NBA
  4346: 'https://www.thesportsdb.com/images/media/league/badge/small/uxwyuw1421512733.png', //MLS
  4424: 'https://www.thesportsdb.com/images/media/league/badge/small/c5r83j1521893739.png', //MLB
  4443: 'https://www.thesportsdb.com/images/media/league/badge/small/twvvqq1447331799.png', //UFC
}

const EventList = ({ events }) => {
  return(
    <div className='event-list'>
      <h4>Games and Matches </h4>
    {
      events.map(event => (
        <div className='event-card'>
          <div className='left'>
            <img src={imagesSources[event.leagueId]} alt='sport league badge'/>
          </div>
          <div className='right'>
            <p>{event.homeTeam} VS {event.awayTeam}</p>
            <div>{event.startTime}</div>
            <div>{event.coverCharge}</div>
            <div>{event.description}</div>
          </div>
        </div>
      ))
   }</div>
  )
}

export default EventList;