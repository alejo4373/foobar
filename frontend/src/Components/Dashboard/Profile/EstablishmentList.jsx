import React, { Component } from 'react';
import { ListGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

//GraphQL Operations
import { getEstablishmentsUserManages } from '../../../Queries/API';

class EstablishmentList extends Component {
  constructor(props) {
    super(props) 
    this.state = {
      establishments: []
    }
  }

  componentDidMount() {
    getEstablishmentsUserManages(20, (err, establishments) => {
      if(err) {
        return console.log('error on getManagerEstablishments', err)
      }
      this.setState({
        establishments: establishments  
      })
    });
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
                <Link to={`/establishments/${est.id}`}>
                  <Panel>
                    <Panel.Heading>{est.name}</Panel.Heading> 
                    <Panel.Body>
                      <p>Manager: {est.managerUsername}</p>
                      <p>Phone: {est.phone}</p>
                    </Panel.Body> 
                  </Panel>
                </Link>
              )
            })
          }
        </ListGroup>
      </div>
    )
  }
}

export default EstablishmentList;