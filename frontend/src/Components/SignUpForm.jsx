import React, { Component } from 'react';
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

    // Auth.confirmSignUp(username, code)
    // .then(data => console.log('confirm===>', data))
    // .catch(err => console.log('confirm===>', err))
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
          <label> Username </label>
          <input type='text' name='username' value={username} onChange={this.handleInput} />
          <label> Password </label>
          <input type='text' name='password' value={password} onChange={this.handleInput} />
          <label> Email </label>
          <input type='text' name='email' value={email} onChange={this.handleInput} />
          <div>
            <p>Are you a bar manager</p>
            <input type='radio' name='manager' value='1' onChange={this.handleInput}/>Yes
            <input type='radio' name='manager' value='0' onChange={this.handleInput}/>No
          </div>
          <input type='submit' value='Submit'/>
        </form>
      </div>
    )
  }
}