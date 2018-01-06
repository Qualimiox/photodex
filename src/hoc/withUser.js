import firebase from 'firebase';
import React, { Component } from 'react';

export default function withUser(WrappedComponent) {
  return class withUserComponent extends Component {
    constructor() {
      super();
      this.unsubscribe = () => { };
      this.state = {};
    }

    componentWillMount() {
      this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
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

    componentWillUnmount() {
      this.unsubscribe();
    }

    render() {
      return this.state.user !== undefined && (
        <WrappedComponent {...this.props} user={this.state.user} />
      );
    }
  }
}
