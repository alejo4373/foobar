import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

import { Auth } from 'aws-amplify'

export default class LogInForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      data: {}
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = this.state
    const { logInUser } = this.props
    logInUser(username, password)
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, password } = this.state
    return (
      <div>
        <h3> Log In </h3>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId='username'>
            <ControlLabel> Username </ControlLabel>
            <FormControl type='text' name='username' value={username} onChange={this.handleInput} />
          </FormGroup>
          <FormGroup controlId='password'>
            <ControlLabel> Password </ControlLabel>
            <FormControl type='text' name='password' value={password} onChange={this.handleInput} />
          </FormGroup>
          <FormControl type='submit' value='Log In'/>
        </form>
      </div>
    )
  }
}