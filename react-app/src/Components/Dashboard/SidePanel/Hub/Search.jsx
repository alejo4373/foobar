import React from 'react';
import EstablishmentList from './SharedComponents/EstablishmentList';
import SearchIcon from '../../../../svg/SearchIcon'
const style = {
  marginTop: '20%',
  marginBottom: '7%',
  width: '70%'
}

const Search = ({ searchResults }) => (
  <div className='profile'>
    <div className='top'>
      <SearchIcon style={style} />
    </div>
    <div className='middle'>
      <h3>Search Results</h3>
    </div>
    <div className='bottom'>
      <EstablishmentList establishments={searchResults} />
    </div>
  </div>
)

export default Search;