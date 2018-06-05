import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DateTime from 'react-datetime';
import moment from 'moment';
import { addEvent } from '../../../Queries/API';

import '../../../Stylesheets/react-datetime.css'
import '../../../Stylesheets/addevent-form.css'

//Child components 
import TeamsAutosuggestInput from '../AddEventForm/TeamsAutosuggestInput'

const leagueImagesSources = {
  //LeagueId: Url
  4380: 'https://www.thesportsdb.com/images/media/league/badge/small/vxwtqq1421413200.png', //NHL
  4391: 'https://www.thesportsdb.com/images/media/league/badge/small/trppxv1421413032.png', //NFL
  4387: 'https://www.thesportsdb.com/images/media/league/badge/small/rwpxsw1421413099.png', //NBA
  4346: 'https://www.thesportsdb.com/images/media/league/badge/small/uxwyuw1421512733.png', //MLS
  4424: 'https://www.thesportsdb.com/images/media/league/badge/small/c5r83j1521893739.png', //MLB
  4443: 'https://www.thesportsdb.com/images/media/league/badge/small/twvvqq1447331799.png', //UFC
}

class AddEventForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      teams: [],
      leagueId: '',
      event: {
        establishmentId: props.establishmentId,
        sportsDbId: 'helloId',
        homeTeam: '',
        awayTeam: '',
        startTime: moment(),
        coverCharge: '0',
        description: ''
      }
    }
  }

  //type will be either homeTeam or awayTeam
  handlePickedTeam = (type, team) => {
      this.setState(prevState => ({
        event: {
          ...prevState.event,
          [type]: team.strTeam,
          [`${type}Badge`]: team.strTeamBadge
        }
      }))
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { startTime, coverCharge } = this.state.event
    const { leagueId } = this.state

    const event = {
      ...this.state.event,
      leagueId,
      startTime: startTime._d.toISOString(),
      coverCharge: coverCharge === '1' ? true : false,
    }

    addEvent(event, (err, res) => {
      if (err) {
        return console.log('error in addEvent()', err)
      }
      console.log('success', res)
    })
  }

  handleInput = (e) => {
    const inputName = e.target.name
    const inputValue = e.target.value
    this.setState(prevState => ({
      event: {
        ...prevState.event,
        [inputName]: inputValue
      }
    }))
  }

  handleLeagueIdChange = (e) => {
    const leagueId = e.target.value

    //MMA league doesn't really have teams. It has fighters but cannot be
    //retrieved with this method
    if(leagueId === 4443) return; 

    fetch(`https://www.thesportsdb.com/api/v1/json/1/lookup_all_teams.php?id=${leagueId}`)
      .then(res => res.json())
      .then(({ teams }) => {
        this.setState(prevState => ({ 
          leagueId: leagueId,
          teams: teams,
          event: { 
            ...prevState.event,
            homeTeam: '', //reset teams on league change 
            awayTeam: '' 
          }
        }))
      })
  }

  handleDateTime = (date) => {
    if (date._isAMomentObject) {
      this.setState({
        startTime: date
      })
    }
  }

  render() {
    const { homeTeam, awayTeam, startTime, coverCharge, description } = this.state.event
    return (
      <div className='addevent-form'>
        <h4>Add Sporting Event</h4>
        <form onSubmit={this.handleSubmit}>
          <div className='tiles'>
            <div className='league-tile'>
              <label htmlFor='nhl'>
                <img src={`${leagueImagesSources[4380]}`} alt='nhl' />
              </label>
              <div>
                <input type='radio' id='nhl' name='leagueId' value='4380' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
            <div className='league-tile'>
              <label htmlFor='nfl'>
                <img src={`${leagueImagesSources[4391]}`} alt='nfl' />
              </label>
              <div>
                <input type='radio' id='nfl' name='leagueId' value='4391' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
            <div className='league-tile'>
              <label htmlFor='nba'>
                <img src={`${leagueImagesSources[4387]}`} alt='nba' />
              </label>
              <div>
                <input type='radio' id='nba' name='leagueId' value='4387' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
            <div className='league-tile'>
              <label htmlFor='mls'>
                <img src={`${leagueImagesSources[4346]}`} alt='mls' />
              </label>
              <div>
                <input type='radio' id='mls' name='leagueId' value='4346' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
            <div className='league-tile'>
              <label htmlFor='mlb'>
                <img src={`${leagueImagesSources[4424]}`} alt='mlb' />
              </label>
              <div>
                <input type='radio' id='mlb' name='leagueId' value='4424' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
            <div className='league-tile'>
              <label htmlFor='ufc'>
                <img src={`${leagueImagesSources[4443]}`} alt='ufc' />
              </label>
              <div>
                <input type='radio' id='ufc' name='leagueId' value='4443' onChange={this.handleLeagueIdChange} />
              </div>
            </div>
          </div>
          <div className='teams section'>
            <TeamsAutosuggestInput 
              name='homeTeam'
              teams={this.state.teams}
              handlePickedTeam={this.handlePickedTeam} 
            />
            <label>VS</label>
            <TeamsAutosuggestInput 
              name='awayTeam'
              teams={this.state.teams}
              handlePickedTeam={this.handlePickedTeam} 
            />
          </div>
          <div className='section'>
            <label>Date and time:</label>
            <DateTime defaultValue={startTime} onChange={this.handleDateTime} />
          </div>
          <div className='section'>
            <label>Is there a cover charge for this event?</label> {' '}
            <div className='yes-no'>
              <div>
                <label htmlFor='yes'>Yes</label> {' '}
                <div>
                  <input type='radio' id='yes' name='coverCharge' value='1' onChange={this.handleInput} />{' '}
                </div>
              </div>
              <div>
                <label htmlFor='no'>No</label> {' '}
                <div>
                  <input type='radio' id='no' name='coverCharge' value='0' onChange={this.handleInput} />
                </div>
              </div>
            </div>
          </div>
          <div className='section'>
            <div>
              <label> Description: </label>
            </div>
            <textarea name='description' value={description} onChange={this.handleInput} />
          </div>
          <div className='section buttons-container'>
            <button type='submit' value='Submit'>Add Event</button>
            <Link to={`/establishments/${this.props.establishmentId}`}><button>Cancel</button></Link>
          </div>
        </form>
      </div>
    )
  }
}

export default AddEventForm