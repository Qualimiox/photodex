import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Authentication from './auth/Authentication';
import Home from './home/Home';
import Photodex from './photodex/Photodex';
import withLayout from '../hoc/withLayout';
import withUser from '../hoc/withUser';
import withTrainer from '../hoc/withTrainer';

export default function App(props) {
  return (
    <Router>
      <Switch>
        <Route exact path="/"
          component={withUser(withLayout(Home))} />
        <Route exact path="/auth/:action"
          component={withUser(withLayout(Authentication))} />
        <Route exact path="/:trainerName/:numberOrMode?"
          component={withTrainer(withUser(withLayout(Photodex)))} />
      </Switch>
    </Router>
  );
}
