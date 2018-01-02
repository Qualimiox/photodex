import firebase from 'firebase';
import React, { Component } from 'react';

export default class PhotodexSubheader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    let db = firebase.firestore();
    this.unsubscribe = db.collection('users').where('name', '==', this.props.trainerName).onSnapshot(snapshot => {
      let trainer = snapshot.docs[0];
      if (trainer) {
        let thumbnails = trainer.data().thumbnails;
        let count = thumbnails ? Object.keys(thumbnails).length : 0;
        this.setState({ count });
      } else {
        this.setState({ count: 0 });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <p style={{ margin: '0', fontWeight: 'bold' }}>{this.props.trainerName}</p>
        {this.state.count !== undefined &&
          <h2 className="Header-subtitle" style={{ margin: '4px 0 0 0' }}>
            Snapped: {this.state.count}
          </h2>}
      </div>
    );
  }
}
