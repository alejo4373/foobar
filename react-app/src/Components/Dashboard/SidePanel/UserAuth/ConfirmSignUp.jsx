import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify'
import Frame from '../SharedComponents/Frame';

export default class ConfirmSignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: this.props.username,
      code: '',
      confirmSuccess: false
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, code } = this.state;
    Auth.confirmSignUp(username, code, {})
      .then(data => {
        this.setState({
          confirmSuccess: data
        })
        console.log('confirmSignUP data:', data)
      })
      .catch(err => {
        console.log('confirmSignUp err:', err)
      })
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, code, confirmSuccess } = this.state
    if (confirmSuccess) {
      return (
        <Redirect to={{
          pathname: '/login',
          state: { signUpConfirmed: confirmSuccess }
        }} />
      )
    } else {
      return (
        <Frame>
          <h3>Account created successfully</h3>
          <p>Please verify your email with the code we sent you</p>
          <form onSubmit={this.handleSubmit}>
            <label>Username:</label>
            <input
              name='username'
              type='text'
              value={username}
              onChange={this.handleInput}
            />
            <label>Code:</label>
            <input
              name='code'
              type='text'
              value={code}
              onChange={this.handleInput}
            />{' '}
            <button type='submit'>Confirm</button>
          </form>
        </Frame>
      )
    }
  }
}