import React from 'react';
import moment from 'moment';

import '../../Stylesheets/event-list.css'

const leaguesImagesSources = {
  //LeagueId: Url
  4380: 'https://www.thesportsdb.com/images/media/league/badge/small/vxwtqq1421413200.png', //NHL
  4391: 'https://www.thesportsdb.com/images/media/league/badge/small/trppxv1421413032.png', //NFL
  4387: 'https://www.thesportsdb.com/images/media/league/badge/small/rwpxsw1421413099.png', //NBA
  4346: 'https://www.thesportsdb.com/images/media/league/badge/small/uxwyuw1421512733.png', //MLS
  4424: 'https://www.thesportsdb.com/images/media/league/badge/small/c5r83j1521893739.png', //MLB
  4443: 'https://www.thesportsdb.com/images/media/league/badge/small/twvvqq1447331799.png', //UFC
}

const EventList = ({ events }) => {
  return (
    <div className='event-list'>
      <h4>Games and Matches </h4>
      {
        events.map(event => (
          <div className='event-card'>
            <div className='top'>
              <div>
                <img
                  src={event.homeTeamBadge}
                  alt={`${event.homeTeam} badge`}
                />
                <label>{event.homeTeam}</label>
              </div>
              <p className='vs'> VS </p>
              <div>
                <img
                  src={event.awayTeamBadge}
                  alt={`${event.awayTeam} badge`}
                />
                <label>{event.awayTeam}</label>
              </div>
            </div>

            <div className='bottom'>
              <div className='league-badge-container'>
                <img
                  src={leaguesImagesSources[event.leagueId]}
                  alt={`leagueId ${event.leagueId}`} 
                />
              </div>
              <div>
                <label>{moment(event.startTime).format('lll')}</label>
              </div>
              <div>
                <label>Cover Charge:</label>{' '}
                {event.coverCharge ? 'Yes' : 'No'}
              </div>
              <label>Description:</label>{' '}
              {event.description}
            </div>
          </div>
        ))
      }</div>
  )
}

export default EventList;