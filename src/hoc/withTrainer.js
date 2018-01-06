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
      let trainerName = this.getTrainerName(this.props);
      this.watchTrainerData(trainerName);
    }

    componentWillReceiveProps(nextProps) {
      let currentTrainerName = this.getTrainerName(this.props);
      let nextTrainerName = this.getTrainerName(nextProps);
      if (nextTrainerName !== currentTrainerName) {
        this.unsubscribe();
        this.watchTrainerData(nextTrainerName);
      }
    }

    watchTrainerData(trainerName) {
      if (!trainerName) {
        return;
      }
      let db = firebase.firestore();
      let ref = db.collection('users').where('name', '==', trainerName);
      this.unsubscribe = ref.onSnapshot(snapshot => {
        let doc = snapshot.docs[0];
        if (doc) {
          let trainer = doc.data();
          trainer.id = doc.id;
          trainer.thumbnails = trainer.thumbnails || {};
          this.setState({ trainer });
        } else {
          this.setState({ trainer: null });
        }
      });
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    getTrainerName(props) {
      return props.match.params.trainerName;
    }

    render() {
      return this.state.trainer !== undefined && (
        <WrappedComponent {...this.props} trainer={this.state.trainer} />
      );
    }
  }
}
