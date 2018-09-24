import React, { Component } from 'react';

import Autosuggest from 'react-autosuggest';

//Autosuggest helpers
const renderSuggestion = (suggestion) => (
  <div className='suggestion-item'>
    <div>{suggestion.strTeam}</div>
  </div>
)

const getSuggestionValue = (suggestion) => suggestion.strTeam

class TeamsAutosuggestInput extends Component {
  constructor(props){
    super(props);
    this.state = {
      suggestionOptions: [],
      displaySuggestions: [],
      selectedSuggestion: '',
    }
  }

  //I believe this gets called because there is a state change in the parent
  //component when selecting a new league, behaving as a 
  //componentWillReceiveProps 
  componentDidUpdate(prevProps, prevState) {
    if(this.props.teams !== prevState.suggestionOptions) {
      this.setState({
        suggestionOptions: this.props.teams,
        displaySuggestions: this.props.teams,
        selectedSuggestion: ''
      })
    }
  }

  onChange = (event, { newValue }) => {
    console.log('onChange() =>', newValue)
    this.setState({
      selectedSuggestion: newValue
    })
  }

  handleSuggestionSelected = (event, { suggestion }) => {
    const { handlePickedTeam, name } = this.props
    console.log(suggestion)
    handlePickedTeam(name, suggestion)

  }

  onSuggestionsFetchRequested = ({ value, reason }) => {
    const { suggestionOptions } = this.state
    const matchedSuggestions = suggestionOptions.filter(sug => {
      return sug.strTeam.toLowerCase().includes(value.toLowerCase())
    })
    this.setState({
      displaySuggestions: matchedSuggestions
    })
  }

  onSuggestionsClearRequested = () => {
    console.log('this.onSuggestionsClearRequested()')
    this.setState({
      displaySuggestions: []
    })
  }

  render() {
    const { displaySuggestions, selectedSuggestion } = this.state

    const inputProps = {
      placeholder: 'Team or Fighter',
      value: selectedSuggestion,
      onChange: this.onChange
    }

    return(
        <Autosuggest
          suggestions={displaySuggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.handleSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion} 
          inputProps={inputProps}
        />
    )
  }
}

export default TeamsAutosuggestInput;