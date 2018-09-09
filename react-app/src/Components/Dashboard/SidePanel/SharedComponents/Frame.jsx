import React, { Component } from 'react';
import '../../../../Stylesheets/frame.css';

class Frame extends Component {
  render() {
    return (
      <div className='frame'>
        <div className='top'>
          {this.props.children}
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

export default Frame;