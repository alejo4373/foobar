import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Frame from '../SharedComponents/Frame';
import BackIcon from '../../../../svg/BackIcon';

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
    e.preventDefault();
    this.props.signUpUser(this.state);
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, password, email } = this.state
    const { message, goBack } = this.props
    if (message === 'signUpSuccess') {
      return (
        <Redirect to={{
          pathname: '/confirm',
          state: { username: username }
        }} />
      )
    } else {
      return (
        <Frame>
          <button className='back-icon-container' onClick={goBack} >
            <BackIcon />
          </button>
          <h3>Sign Up</h3>
          <form onSubmit={this.handleSubmit}>
            <div>
              <label> Username: </label>
              <input className='input-box' type='text' name='username' value={username} onChange={this.handleInput} required />
            </div>

            <div>
              <label> Password: </label>
              <input className='input-box' type='text' name='password' value={password} onChange={this.handleInput} required />
            </div>

            <div>
              <label> Email: </label>
              <input className='input-box' type='text' name='email' value={email} onChange={this.handleInput} required />
            </div>
            {
              message ? <div>
                <p>{message}</p>
              </div> : ''
            }
            <button className='btn' type='submit' >Sign Up</button>
          </form>
          <p>Have and account? <Link to='/login'>Log In</Link> </p>
        </Frame>
      )
    }
  }
}