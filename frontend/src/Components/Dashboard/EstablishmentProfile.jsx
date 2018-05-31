import React, { Component } from 'react';
import AddEventForm from './Establishments/AddEventForm';

class EstablishmentProfile extends Component {
  constructor(props) {
    super(props) 
    this.state = {
      establishment: {}
    }
  }

  componentDidMount() {
  }

  render() {
    const { establishmentId } = this.props.match.params
    return(
      <div>
        <h3> Establishment Profile</h3>
        <AddEventForm establishmentId={establishmentId}/>
        
      </div>
    )
  }
}

export default EstablishmentProfile;