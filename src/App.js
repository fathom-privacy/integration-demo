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
      inProgress: false,
      returning: false
    };
  }

  componentDidMount() {
    //Fathom initializes button with id "fathom-signup"
    //when button is clicked, promise is resolved and returns a newLookup object
    new fathom("906c50a3-0e0e-4005-8164-20956be4368d").initButton().then((newLookup) => { 
      this.setState({session_id: newLookup.getSessionId()})
        
      //newLookup's function listenForStatus(callback) will run {callback} on every new status update
      newLookup.listenForStatus((message) => {this.updateStatus(newLookup, message)})
    })

    this.getData()
  }

  //helper func to read parameters from the url
  getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  //this function will try to get the session ID from the input field. If not found, it will try to get it from the url
  getData() {
    let session_id = ""
    if (this.getParameterByName("session_id") !== null) {
      session_id = this.getParameterByName("session_id")
    } else if (document.getElementById("session_id")) {
      session_id = document.getElementById("session_id").value
    }
    
    //if a session ID was found:
    if (session_id){
      let lookup = new fathom("906c50a3-0e0e-4005-8164-20956be4368d").lookup(session_id)
      lookup.getLIData().then((results) => {
        document.getElementById('Results').value = JSON.stringify(results);
      })
      lookup.listenForStatus((message) => {this.updateStatus(lookup, message)})
  
      this.setState({session_id: session_id}) 
    }
  }

  updateStatus(lookup, message){
    console.log(message)
    if (message.status === "in progress" && !this.state.inProgress) {
      this.setState({status: "Data pull in progress. Should take between 20-40 minutes.", inProgress: true})
    } else if (message.status.slice(-1) === "%") {
      this.setState({status:message.status})
    } else if (message.status === "complete") {
      //when the status is 'complete', lookup's getLIData() function will return the data for that user's lookup 
      console.log("data sync is complete")
      this.setState({status: "Complete"})
      lookup.getLIData().then((results) => { 
        document.getElementById('Results').value = JSON.stringify(results);
        console.log(results) 
      })
    }
  }


  render() {
    return (
      <div className="App">
        <a className="App-header">
          <a href="https://fathomprivacy.com" className="App-link">
            <img src={logo} className="App-logo" alt="logo" />  
          </a>
        </a>
        <div className="App-body">
          <h1>Fathom Integration Demo</h1>
          <p>Click below to see an example of the integration flow</p>
          
          <div id="fathom-signup" className="li-button"/>
          <div className="link" onClick={()=>{this.setState({returning:!this.state.returning})}}>Returning to check on your data?</div>
          {this.state.returning ? 
            <div>
              <input id="session_id" placeholder="xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxxx"/>
              <div className="button" onClick={()=>this.getData()}>Fetch data</div>
            </div>
            :
            <div />
          }

          <div className="row">
            <div className="Status-box">
              <p><b>Status: </b></p> 
              <p>{this.state.status}</p>
            </div>
            
            <div>
              <p><b>Your results:</b></p>
              <textarea rows="5" cols="80" id="Results" />
            </div>
          </div>

          {this.state.status === "Unstarted" ? 
            <div /> 
            :
            <div className="row session_id_row">
              You can return later to check on your progress with your session id: {this.state.session_id}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
