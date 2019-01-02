import React, { Component } from 'react';
import EstablishmentListItem from './EstablishmentListItem';

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
              return (<EstablishmentListItem establishment={est} key={est.id} />)
            })
          }
        </ul>
      </div>
    )
  }
}

export default EstablishmentList;
