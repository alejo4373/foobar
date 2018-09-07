import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Frame from '../Dashboard/Frame'
import ConfirmSignUp from './ConfirmSignUp';

export default class SignUpForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      email: '',
      waitingConfirm: false
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      waitingConfirm: true
    })
    this.props.signUpUser(this.state);
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, password, email, waitingConfirm } = this.state
    const { message } = this.props;
    return (
      <Frame>
        <h3>Sign Up</h3>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel> Username </ControlLabel>
            <FormControl type='text' name='username' value={username} onChange={this.handleInput} />
          </FormGroup>

          <FormGroup>
            <ControlLabel> Password </ControlLabel>
            <FormControl type='text' name='password' value={password} onChange={this.handleInput} />
          </FormGroup>

          <FormGroup>
            <ControlLabel> Email </ControlLabel>
            <FormControl type='text' name='email' value={email} onChange={this.handleInput} />
          </FormGroup>
          {
            message ? <div>
              <p>{message}</p>
            </div> : ''
          }
          <Button type='submit' value='Submit'>Sign Up</Button>
        </form>
        <p>Have and account? <Link to='/login'>Log In</Link> </p>
        {
          waitingConfirm ? <ConfirmSignUp username={username} /> : ""
        }
      </Frame>
    )
  }
}