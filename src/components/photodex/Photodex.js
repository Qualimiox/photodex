import firebase from 'firebase';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { pokedex } from '../../pokedex';
import './Photodex.css';
import Entry from './Entry';
import Placeholder from './Placeholder';

export default class Photodex extends Component {
  constructor(props) {
    super(props);
    this.trainerName = props.match.params.trainer;
    this.state = {};
  }

  componentDidMount() {
    let db = firebase.firestore();
    db.collection('users').where('name', '==', this.trainerName).get().then(snapshot => {
      let trainer = snapshot.docs[0];
      if (trainer) {
        let trainerId = trainer.id;
        let thumbnails = trainer.data().thumbnails || {};
        this.setState({ trainerId, thumbnails });
      } else {
        this.setState({ trainerId: null });
      }
    });
  }

  render() {
    if (this.state.trainerId === null) {
      return (<div>Trainer not found!</div>);
    } else if (!this.state.trainerId || !this.state.thumbnails) {
      return null;
    }

    let editMode = false;
    let numberOrMode = this.props.match.params.numberOrMode;
    let canEdit = this.props.user && (this.props.user.name === this.trainerName);
    if (numberOrMode === 'edit' && canEdit) {
      editMode = true;
    } else if (numberOrMode) {
      return <Redirect to={`/${this.trainerName}`} />
    }

    let trainerId = this.state.trainerId;
    let entries = pokedex.map((pokemon, i) => (
      <Entry key={i} pokemon={pokemon} trainerId={trainerId} editMode={editMode}
        thumbnailURL={this.state.thumbnails[pokemon.number]} />
    ));

    // Placeholders provide a hacky way to ensure that last row of aligns to grid.
    // http://stackoverflow.com/a/22018710
    let placeholders = new Array(20).fill(null).map((_, i) => <Placeholder key={i} />);

    return (
      <div className="Photodex">
        {entries}
        {placeholders}
      </div>
    );
  }
}
