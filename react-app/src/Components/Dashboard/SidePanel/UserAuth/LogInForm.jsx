import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Frame from '../SharedComponents/Frame';
import BackIcon from '../../../../svg/BackIcon';

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
    const { logInUser } = this.props
    let { username, password } = this.state
    console.log(e.target.name);
    if (e.target.name === 'demo') {
      username = 'AEstablishmentManagerUser'
      password = 'HelloWorld123$'
    }
    logInUser(username, password)
  }

  handleInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    const { username, password } = this.state;
    const { user, message, goBack } = this.props;

    if (user) { return <Redirect to='/' /> }

    return (
      <Frame>
        <button className='button-icon-container' onClick={goBack} >
          <BackIcon />
        </button>
        {message ? <div><p>{message}</p></div> : ''}
        <h3> Log In </h3>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label> Username: </label>
            <input className='input-box' type='text' name='username' value={username} onChange={this.handleInput} required />
          </div>
          <div>
            <label> Password: </label>
            <input className='input-box' type='password' name='password' value={password} onChange={this.handleInput} required />
          </div>
          <div className='btns-box'>
            <button className='btn' type='submit'> Log In </button>
            <button className='btn' name='demo' onClick={this.handleSubmit}> Demo Log In </button>
          </div>
        </form>
        <p>Or <Link to='/signup'>Sign-Up</Link> if you are a business owner/manager</p>
      </Frame>
    )
  }
}