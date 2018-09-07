import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify'
export default class ConfirmSignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      success: null
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let { username } = this.props;
    let { code } = this.state;
    Auth.confirmSignUp(username, code, {})
      .then(data => {
        this.setState({
          success: data
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
    const { confirmCode, success } = this.state
    return (
      <div>{
        success ? <Redirect to={{
          pathname: '/login',
          state: { signUpConfirmed: success }
        }} /> : (
          <form onSubmit={this.handleSubmit}>
            <p>You Should Have received a confirmation code in you email</p>
            <input
              name='code'
              type='text'
              value={confirmCode}
              onChange={this.handleInput}
            />
            <button type='submit'>Confirm</button>
          </form>)
      }</div>
    )
  }
}