import React, { Component } from 'react';

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
    let userData = {
      Username: username,
    }
  }

  handleInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    console.log(this.state)
    const { username, password } = this.state
    return (
      <div>
        <h3> Log In </h3>
        <form onSubmit={this.handleSubmit}>
          <label> Username </label>
          <input type='text' id='username' value={username} onChange={this.handleInput} />
          <label> Password </label>
          <input type='text' id='password' value={password} onChange={this.handleInput} />
          <input type='submit' value='Log In'/>
        </form>
      </div>
    )
  }
}