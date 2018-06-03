import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button, Form} from 'react-bootstrap';
import DateTime from 'react-datetime';
import moment from 'moment';
import { addEvent } from '../../../Queries/API';

import '../../../Stylesheets/react-datetime.css'

class AddEventForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      establishmentId: props.establishmentId,
      sportsDbId: 'helloId',
      leagueId: '',
      homeTeam: '',
      awayTeam: '',
      startTime: moment(),
      coverCharge: '0',
      description: ''
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { startTime, coverCharge } = this.state

    const event = {
      ...this.state,
      startTime: startTime._d.toISOString(),
      coverCharge: coverCharge === '1' ? true : false,
    } 

    addEvent(event, (err, res) => {
      if(err) {
        return console.log('error in addEvent()', err)
      }
      console.log('success', res)
    })
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleDateTime = (date) => {
    if(date._isAMomentObject) {
      this.setState({
        startTime: date
      })
    }
  }

  render() {
    const { homeTeam, awayTeam, startTime, coverCharge, description } = this.state
    return (
      <div>
        <h3>Add Sporting Event</h3>
        <Form inline onSubmit={this.handleSubmit}>
          <FormGroup controlId='leagueId'>
            <ControlLabel>League</ControlLabel>
            <Radio inline name='leagueId' value='4380' onChange={this.handleInput}>NHL</Radio>{' '} 
            <Radio inline name='leagueId' value='4391' onChange={this.handleInput}>NFL</Radio>{' '} 
            <Radio inline name='leagueId' value='4387' onChange={this.handleInput}>NBA</Radio>{' '}
            <Radio inline name='leagueId' value='4346' onChange={this.handleInput}>MLS</Radio>{' '}
            <Radio inline name='leagueId' value='4424' onChange={this.handleInput}>MLB</Radio>{' '}
            <Radio inline name='leagueId' value='4443' onChange={this.handleInput}>UFC</Radio>
          </FormGroup>
          <FormGroup>
            <FormControl type='text' placeholder='Home team' name='homeTeam' value={homeTeam} onChange={this.handleInput} />
          </FormGroup>
          {' '}<ControlLabel>VS</ControlLabel>{' '}
          <FormGroup>
            <FormControl type='text' placeholder='Away team' name='awayTeam' value={awayTeam} onChange={this.handleInput} />
          </FormGroup>
          <div>
            <ControlLabel>Date and time</ControlLabel>
            <DateTime defaultValue={startTime} onChange={this.handleDateTime}/>
          </div>

          <div>
            <FormGroup>
              <ControlLabel>Is there a cover charge for this event?</ControlLabel> {' '}
              <Radio inline name='coverCharge' value='1' onChange={this.handleInput}>Yes</Radio>{' '}
              <Radio inline name='coverCharge' value='0' onChange={this.handleInput}>No</Radio>
            </FormGroup>
          </div>
          <div>
            <FormGroup>
              <ControlLabel> Description </ControlLabel>
              <FormControl componentClass='textarea' name='description' value={description} onChange={this.handleInput} />
            </FormGroup>
          </div>
          <Button type='submit' value='Submit'>Sign Up</Button>
        </Form>
      </div>
    )
  }
}

export default AddEventForm