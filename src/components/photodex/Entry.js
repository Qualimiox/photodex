import alertify from 'alertify.js';
import firebase from 'firebase';
import React, { Component } from 'react';
import IconButton from '../shared/IconButton';
import Spinner from '../shared/Spinner';

export default class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.setState({ url: this.props.thumbnailURL });
  }

  onUploadClicked() {
    if (this.state.url) {
      alertify.confirm(`Replace ${this.props.pokemon.name} snap?`, () => this.uploadSnap());
    } else {
      this.uploadSnap();
    }
  }

  uploadSnap() {
    this.fileInput.onchange = () => {
      let file = this.fileInput.files[0];
      if (file) {
        this.setState({ url: null });
        this.getStorageRef().put(file).then(snapshot => {
          let url = snapshot.downloadURL;
          this.updateThumbnailURL(url);
          this.setState({ url });
        });
      }
      this.fileInput.onchange = null;
    }
    this.fileInput.click();
  }

  onDeleteClicked() {
    alertify.confirm(`Delete ${this.props.pokemon.name} snap?`, () => this.deleteSnap());
  }

  deleteSnap() {
    this.getStorageRef().delete();
    this.updateThumbnailURL(firebase.firestore.FieldValue.delete());
    this.setState({ url: undefined });
  }

  getStorageRef() {
    return firebase.storage().ref(`photodex/${this.props.trainerId}/raw/${this.props.pokemon.number}`);
  }

  updateThumbnailURL(url) {
    let updateData = {};
    updateData[`thumbnails.${this.props.pokemon.number}`] = url;
    firebase.firestore().collection('users').doc(this.props.trainerId).update(updateData);
  }

  render() {
    let className = `Photodex-Entry ${this.props.pokemon.region.toLowerCase()}`;
    if (!this.props.pokemon.obtainable) {
      className += ' unobtainable';
    }
    return (
      <div className={className}>
        <input type="file" style={{ display: 'none' }} ref={input => this.fileInput = input} />
        {this.state.url ?
          <img src={this.state.url} alt={this.props.pokemon.name} /> :
          this.state.url === null ?
            <Spinner /> :
            this.props.pokemon.number}
        {this.props.editMode && this.props.pokemon.obtainable &&
          <div className="Photodex-Entry-edit">
            <div className="Photodex-Entry-edit-name">{this.props.pokemon.name}</div>
            <div className="Photodex-Entry-edit-buttons">
              <IconButton icon="upload" onClick={() => this.onUploadClicked()}
                title="Upload" aria-label="Upload" />
              {this.state.url && <IconButton icon="trash" onClick={() => this.onDeleteClicked()}
                title="Delete" aria-label="Delete" />}
            </div>
          </div>}
      </div>
    );
  }
}
