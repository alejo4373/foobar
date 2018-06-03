import React, { Component } from 'react';
import { ListGroup, Panel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import '../../../Stylesheets/establishment-list.css'

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
      <div className='establishment-list'>
        <h4>Establishments</h4>
        <ul>
          {
            establishments.map(est => {
              return(
                <Link to={`/establishments/${est.id}`}>
                  <div 
                    className='establishment-card'
                    to={`/establishments/${est.id}`}
                  >
                    <div className='left' style={{backgroundImage: `url(${est.googlePhotoUrl})`}}>
                    </div>
                    <div className='right'>
                      <p className='name'>{est.displayName}</p> 
                      <p>{est.phone}</p>
                    </div> 
                  </div>
                </Link>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

export default EstablishmentList;