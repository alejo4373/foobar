import React, { Component } from 'react';
import { ListGroup, Panel } from 'react-bootstrap';

//Amplify 
import { API, graphqlOperation } from 'aws-amplify'

//GraphQL Operations
import GetAllEstablishments from '../../Queries/GetAllEstablishments';

class Establishments extends Component {
  constructor(props) {
    super(props) 
    this.state = {
      establishments: []
    }
  }

  componentDidMount() {
    this.getAllEstablishments();
  }

  async getAllEstablishments() {
    try {
      const { data } = await API.graphql(graphqlOperation(GetAllEstablishments))
      this.setState({establishments: data.allEstablishments.establishments})
    } catch (err) {
      console.log('Error fetching establishments:', err)
    }
  }

  render() {
    const { establishments } = this.state;
    console.log(this.state)
    return(
      <div>
        <h3>Establishments</h3>
        <ListGroup componentClass='ul'>
          {
            establishments.map(est => {
              return(
                <Panel>
                  <Panel.Heading>{est.name}</Panel.Heading> 
                  <Panel.Body>
                    <p>Manager: {est.managerUsername}</p>
                    <p>Phone: {est.phone}</p>
                  </Panel.Body> 
                </Panel>
              )
            })
          }
        </ListGroup>
      </div>
    )
  }
}

export default Establishments;