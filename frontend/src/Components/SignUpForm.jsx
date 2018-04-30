import React, { Component } from 'react';
import userPool from '../pool';

export default class SignUpForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      email: '',
    }
  }

  handleSubmit = (e) => {
    const { handleSignUpResponse } = this.props
    e.preventDefault();
    const { username, password, email } = this.state
    let attributeList = [];
    let dataEmail = {
      Name: 'email',
      Value: email
    }
    attributeList.push(dataEmail);
    userPool.signUp(username, password, attributeList, null, (err, res) =>{
      if(err) {
        console.log('err====>',err,'err.stack=====>', err.stack);
        return handleSignUpResponse(err);
      }
      handleSignUpResponse(res);
    })
  }

  handleInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  render() {
    const { username, password, email } = this.state
    return (
      <div>
        <h3>Sign Up</h3>
        <form onSubmit={this.handleSubmit}>
          <label> Username </label>
          <input type='text' id='username' value={username} onChange={this.handleInput} />
          <label> Password </label>
          <input type='text' id='password' value={password} onChange={this.handleInput} />
          <label> Email </label>
          <input type='text' id='email' value={email} onChange={this.handleInput} />
          <input type='submit' value='Submit'/>
        </form>
      </div>
    )
  }
}