import React, { Component } from 'react';
import '../../Stylesheets/map-searchbox.css'
import Autosuggest from 'react-autosuggest';
import { getEstablishmentSuggestions } from '../../Queries/API'

//Autosuggest helpers
const renderSuggestion = (suggestion) => (
  <div>
    {suggestion.displayName}
  </div>
)

const getSuggestionValue = (suggestion) => suggestion.displayName

class MapSearchBox extends Component {
  constructor(props){
    super(props);
    this.state = {
      suggestions: [],
      displaySuggestions: [],
      selectedSuggestion: '',
    }
  }

  getSuggestions = (pattern) => {
    getEstablishmentSuggestions(pattern, (err, matches) => {
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
    //When page loses focus this function gets called again and we do not want
    //to make a network request unless the input actually changed
    if(reason == 'input-changed') {
      clearTimeout(window.requestTimeout)
      //Set timer in the window object
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
      <div className='map-searchbox'>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion} 
          inputProps={inputProps}
        />
      </div>
    )
  }
}

export default MapSearchBox;