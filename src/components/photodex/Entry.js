import alertify from 'alertify.js';
import firebase from 'firebase';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import IconButton from '../shared/IconButton';

export default class Entry extends Component {
  onUploadClicked() {
    if (this.props.snap) {
      alertify.confirm(`Replace ${this.props.pokemon.name} snap?`, () => this.uploadSnap());
    } else {
      this.uploadSnap();
    }
  }

  uploadSnap() {
    this.fileInput.onchange = () => {
      let file = this.fileInput.files[0];
      if (file) {
        this.updateStatus('Uploading').then(() =>
          this.getStorageRef('raw').put(file).then(
            () => this.updateStatus('Processing')
          )
        );
      }
      this.fileInput.onchange = null;
    }
    this.fileInput.click();
  }

  updateStatus(value) {
    let updateData = {};
    updateData[`snaps.${this.props.pokemon.number}.status`] = value;
    return this.getDocRef().update(updateData);
  }

  onDeleteClicked() {
    alertify.confirm(`Delete ${this.props.pokemon.name} snap?`, () => this.deleteSnap());
  }

  deleteSnap() {
    if (!this.props.snap) {
      return Promise.resolve();
    }
    return this.updateStatus('Deleting').then(() => Promise.all([
      this.getStorageRef('raw').delete(),
      this.getStorageRef('thumbnail').delete(),
      this.getStorageRef('gallery').delete()
    ])).then(() => {
      let updateData = {};
      updateData[`snaps.${this.props.pokemon.number}`] = firebase.firestore.FieldValue.delete();
      this.getDocRef().update(updateData);
    });
  }

  getDocRef() {
    return firebase.firestore().collection('users').doc(this.props.trainer.id);
  }

  getStorageRef(file) {
    let path = `photodex/${this.props.trainer.id}/snaps/${this.props.pokemon.number}/${file}`;
    return firebase.storage().ref(path);
  }

  render() {
    let { editMode, pokemon, snap, trainer } = this.props;
    let className = `Photodex-Entry ${pokemon.region.toLowerCase()}`;
    let status = snap ? snap.status : undefined;
    if (!pokemon.obtainable) {
      className += ' unobtainable';
    }
    return (
      <div className={className}>
        <input type="file" style={{ display: 'none' }} ref={input => this.fileInput = input} />
        {status ? <Spinner status={status} /> :
          snap ? (
            <Link to={`/${trainer.name}/${pokemon.number}`}>
              <img src={snap.thumbnail} alt={pokemon.name} />
            </Link>
          ) : pokemon.number}
        {editMode && pokemon.obtainable &&
          <div className="Photodex-Entry-edit">
            <div className="Photodex-Entry-edit-name">{pokemon.name}</div>
            {!status && <div className="Photodex-Entry-edit-buttons">
              <IconButton icon="upload" onClick={() => this.onUploadClicked()}
                title="Upload" aria-label="Upload" />
              {snap && <IconButton icon="trash" onClick={() => this.onDeleteClicked()}
                title="Delete" aria-label="Delete" />}
            </div>}
          </div>}
      </div>
    );
  }
}
