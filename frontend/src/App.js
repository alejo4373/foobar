import React, { Component } from 'react';
import SignUpForm from './Components/SignUpForm';
import LogInForm from './Components/LogInForm';

class App extends Component {
  state = {
    singUpSuccess: false,
    user: {},
    toogleSignUp: true
  }

  handleSignUpResponse = (res) => {
    console.log('response=======>', res)
    if(res.user) {
      this.setState({
        singUpSuccess: true,
        user: res.user,
        message: 'You have signed up and can now log in'
      })  
    }
    else {
      this.setState({
        singUpSuccess: false,
        user: null,
        message: res.message,
      })
    }
  }

  handleToogleForms = () => {
    this.setState(prevState => {
      return {toogleSignUp: !prevState.toogleSignUp}
    })
  }

  render() {
    console.log(this.state)
    const { message, toogleSignUp } = this.state
    return (
      <div className="App">
      {
        toogleSignUp 
          ? <SignUpForm handleSignUpResponse={this.handleSignUpResponse}/>
          : <LogInForm handleLogInResponse={this.handleLogInResponse} />
      }
      <p>{message}</p>
      <p onClick={this.handleToogleForms}>{toogleSignUp ? 'Log In' : 'Sign Up'}</p>

      </div>
    );
  }
}

export default App;
