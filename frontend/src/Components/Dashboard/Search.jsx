import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import EstablishmentList from '../Dashboard/Profile/EstablishmentList';
import SearchIcon from '../../svg/SearchIcon'
// import '../../Stylesheets/profile.css'
 const style = {
    marginTop: '20%',
    marginBottom: '7%',
    width: '70%'
 }

const Search = ({searchResults}) => (
  <div className='profile'>
      <div className='top'>
        <SearchIcon style={style}/>
      </div>
      <div className='middle'>
        <h3>Search Results</h3>
      </div>
     <div className='bottom'>
       <EstablishmentList establishments={searchResults}/>
     </div>
  </div>
)

export default Search;