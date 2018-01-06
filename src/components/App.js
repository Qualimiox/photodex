import firebase from 'firebase';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Authentication from './auth/Authentication';
import Home from './home/Home';
import Photodex from './photodex/Photodex';
import withLayout from '../hoc/withLayout';
import withProps from '../hoc/withProps';

export default class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        let db = firebase.firestore();
        db.collection('users').doc(user.uid).get().then(doc => {
          Object.assign(user, doc.data());
          this.setState({ user });
        });
      } else {
        this.setState({ user: null });
      }
    });
  }

  withUser(component) {
    return withProps(component, { user: this.state.user });
  }

  render() {
    return this.state.user !== undefined && (
      <Router>
        <Switch>
          <Route exact path="/" component={this.withUser(withLayout(Home))} />
          <Route exact path="/auth/:action" component={this.withUser(withLayout(Authentication))} />
          <Route exact path="/:trainer/:numberOrMode?" component={this.withUser(withLayout(Photodex))} />
        </Switch>
      </Router>
    );
  }
}
