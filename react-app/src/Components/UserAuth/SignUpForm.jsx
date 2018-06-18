import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Radio, Button} from 'react-bootstrap';

import { Auth } from 'aws-amplify';

export default class SignUpForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: 'princess123',
      password: 'Tiziana4373$',
      manager: '1',
      email: 'alejo4373@gmail.com',
    }
  }

  handleSubmit = (e) => {
    const { handleSignUpResponse } = this.props
    e.preventDefault();
    const { username, password, email, manager } = this.state

    Auth.signUp({
      username,
      password,
      attributes: {
        email,
        "custom:managerBool": manager
      }
    })
    .then(data => console.log(data))
    .catch(err => console.log(err))
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, password, email } = this.state
    return (
      <div>
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

          <FormGroup>
            <p>Are you a bar manager</p>
            <Radio inline name='manager' value='1' onChange={this.handleInput}>Yes</Radio>{' '}
            <Radio inline name='manager' value='0' onChange={this.handleInput}>No</Radio>
          </FormGroup>
          <Button type='submit' value='Submit'>Sign Up</Button>
        </form>
      </div>
    )
  }
}