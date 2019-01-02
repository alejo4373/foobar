import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class EstablishmentListItem extends Component {
  constructor(props) {
    super(props);
    this.state = props.establishment
  }

  componentDidMount() {
    const establishment = this.state;
    establishment.getPhotoUrl((err, photo) => {
      if (photo) {
        this.setState({
          googlePhotoUrl: photo.getUrl({ maxWidth: 200 })
        })
      } else {
        console.log('error loading image', err);
      }
    })

  }

  render() {
    const est = this.state;
    return (
      <li>
        <Link to={`/establishments/${est.id}`} >
          <div
            className='establishment-card'
            to={`/establishments/${est.id}`}
          >
            <div className='left' style={{
              backgroundImage: `url(${est.googlePhotoUrl})`
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
  }
}

export default EstablishmentListItem;
