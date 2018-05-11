import React, { Component } from 'react';

class AllEvents extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    console.log('AllEvents props===>', this.props)
    return(
      <div>
        <h3>This is AllEvents Component</h3>
      </div>
    )
  }
}

export default AllEvents;