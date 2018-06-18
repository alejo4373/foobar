import React, { Component } from 'react';
import '../../Stylesheets/welcome.css'
import logo from '../../svg/foobar-logo1.svg'
class Welcome extends Component {
  render() {
    return (
      <div className='welcome'>
        <div className='top'>
          <img  className='logo' src={logo} alt='sports and beer'/>
        </div>
        <div className='middle'>
          <h1>FooBar</h1>
        </div>
        <div className='bottom'>
          <h3>
            'Where to find your Sport and Beer' 
          </h3>
        </div>
      </div>
    )
  }
}

export default Welcome;