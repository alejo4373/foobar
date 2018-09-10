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
      message: '',
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
        let message = "User is already confirmed or does not have an account.";
        if (err.code === 'ExpiredCodeException') { message = err.message }
        this.setState({
          message: message
        })
        console.log('confirmSignUp err:', err)
      })
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, code, message, confirmSuccess } = this.state
    if (confirmSuccess) {
      return (
        <Redirect to={{
          pathname: '/login',
          state: { message: 'Your account has been confirmed. You can now Log-in.' }
        }} />
      )
    } else {
      return (
        <Frame>
          <h3>Account created successfully</h3>
          <p>Please verify your email with the code we sent you.</p>
          <form onSubmit={this.handleSubmit}>
            <label>Username:</label>
            <input
              name='username'
              type='text'
              value={username}
              className='input-box'
              onChange={this.handleInput}
              required
            />
            <label>Code:</label>
            <input
              name='code'
              type='text'
              value={code}
              className='input-box'
              onChange={this.handleInput}
              required
            />{' '}
            <button className='btn' type='submit'>Confirm</button>
            <div>{message}</div>
          </form>
        </Frame>
      )
    }
  }
}