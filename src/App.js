import React from 'react';
import logo from './Fathom.png';
import './App.css';

import fathom from "fathom-privacy"



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "Unstarted",
      results: "Your results here",
      inProgress: false
    };
  }

  componentDidMount() {

    //Fathom initializes button with id "fathom-signup"
    //when button is clicked, promise is resolved and returns a newLookup object
    fathom("906c50a3-0e0e-4005-8164-20956be4368d").then((newLookup) => {     
      
      //newLookup's function listenForStatus(callback) will run {callback} on every new status update
      newLookup.listenForStatus((message) => {

        if (message.status === "in progress" && !this.state.inProgress) {
          this.setState({status: "Data pull in progress. Should take around 5 minutes.", inProgress: true})
        } else if (message.status.slice(-1) === "%") {
          this.setState({status:message.status})
        } else if (message.status === "complete") {
          //when the status is 'complete', newLookup's getLIData() function will return the data for that user's lookup 
          console.log("data sync is complete")
          this.setState({status: "Complete"})
          newLookup.getLIData().then((results) => { 
            document.getElementById('Results').value = JSON.stringify(results);
            console.log(results) 
          })
        }
      })
    })
  }


  render() {
    return (
      <div className="App">
        <a className="App-header">
          <a href="https://fathomprivacy.com" className="App-link">
            <img src={logo} className="App-logo" alt="logo" />  
            <h3>Fathom</h3>
          </a>
        </a>
        <body className="App-body">
          <h1>Fathom Integration Demo</h1>
          <p>Click below to see an example of the integration flow</p>
          
          <div id="fathom-signup" className="li-button"/>

          <div className="Status-row">
            <div className="Status-box">
              <p><b>Status: </b></p> 
              <p>{this.state.status}</p>
            </div>
            <div>
              <p><b>Your results:</b></p>
              <textarea rows="5" cols="80" id="Results" />
            </div>
          </div>
        </body>
      </div>
    );
  }
}

export default App;
