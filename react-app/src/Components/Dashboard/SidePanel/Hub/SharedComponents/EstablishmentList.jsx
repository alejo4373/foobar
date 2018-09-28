import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import '../../../../../Stylesheets/establishment-list.css'



class EstablishmentList extends Component {
  render() {
    const { establishments } = this.props;
    return (
      <div className='establishment-list'>
        <h4>Establishments</h4>
        <ul>
          {
            establishments.map((est, i) => {
              return (
                <li>
                  <Link to={`/establishments/${est.id}`} key={i}>
                    <div
                      className='establishment-card'
                      to={`/establishments/${est.id}`}
                    >
                      <div className='left' style={{
                        backgroundImage: `url(https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${est.googlePhotoReference}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY})`
                      }}>
                      </div>
                      <div className='right'>
                        <p className='name'>{est.displayName}</p>
                        <p>{est.phone}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

export default EstablishmentList;