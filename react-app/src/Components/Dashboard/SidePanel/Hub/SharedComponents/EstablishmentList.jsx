import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import '../../../../../Stylesheets/establishment-list.css'



class EstablishmentList extends Component {
  render() {
    const { establishments } = this.props;
    return(
      <div className='establishment-list'>
        <h4>Establishments</h4>
        <ul>
          {
            establishments.map((est, i) => {
              return(
                <Link to={`/establishments/${est.id}`} key={i}>
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