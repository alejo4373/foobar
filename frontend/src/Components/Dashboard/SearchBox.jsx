import React, { Component } from 'react';
import { Link  } from 'react-router-dom';

import Autosuggest from 'react-autosuggest';
import { getEstablishmentSuggestions } from '../../Queries/API'
import PinIcon from '../../svg/PinIcon'

//Autosuggest helpers
const renderSuggestion = (suggestion) => (
  <div className='suggestion-item'>
    <PinIcon/>    
    <Link to={`/establishments/${suggestion.id}`}>{suggestion.displayName}</Link>
  </div>
)

const getSuggestionValue = (suggestion) => suggestion.displayName

class SearchBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      suggestions: [],
      displaySuggestions: [],
      selectedSuggestion: '',
    }
  }

  getSuggestions = (pattern) => {
    getEstablishmentSuggestions(pattern.toLowerCase(), (err, matches) => {
      if(err) {
        return console.log('err in getEstablishmentSuggestions()', err)
      }
      this.setState({
        suggestions: matches,
        displaySuggestions: matches
      })
    })
  }

  onChange = (event, { newValue }) => {
    console.log('onChange() =>', newValue)
    this.setState({
      selectedSuggestion: newValue
    })
  }

  onSuggestionsFetchRequested = ({ value, reason }) => {
    // We do not want to make a network request unless the input actually changed
    if(reason === 'input-changed') {
      // If there was a previous timer running clear it
      clearTimeout(window.requestTimeout)
      // Set timer in the window object
      window.requestTimeout = window.setTimeout(() => {
        this.getSuggestions(value)
      }, 1000)
      
      console.log('this.onSuggestionsFetchRequested() ====>', value)
    }
  }

  onSuggestionsClearRequested = () => {
    console.log('this.onSuggestionsClearRequested()')
    this.setState({
      displaySuggestions: []
    })
  }



  render() {
    const { suggestions, selectedSuggestion } = this.state

    const inputProps = {
      placeHolder: 'Event or Establishment',
      value: selectedSuggestion,
      onChange: this.onChange
    }

    return(
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion} 
          inputProps={inputProps}
        />
    )
  }
}

export default SearchBox;