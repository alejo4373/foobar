import React, { Component } from 'react';
import '../../Stylesheets/welcome.css'
import logo from '../../svg/foobar-logo1.svg'
import Frame from './Frame'

class Welcome extends Component {
  render() {
    return (
      <div className='welcome'>
        <Frame>
            <img className='logo' src={logo} alt='sports and beer' />
        </Frame>
      </div>
    )
  }
}

export default Welcome;