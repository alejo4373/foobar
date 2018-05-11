import React, { Component } from 'react';

class AllEstablishments extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  render(){
    console.log('AllEstablishments props===>', this.props)
    return(
      <div>
        <h3>This is AllEstablishments Component</h3>
      </div>
    )
  }
}

export default AllEstablishments