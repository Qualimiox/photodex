import firebase from 'firebase';
import React, { Component } from 'react';
import AuthenticationCancel from './AuthenticationCancel';
import EmailInput from '../form/EmailInput';
import Form from '../form/Form';
import PasswordInput from '../form/PasswordInput';
import SmallPrint from '../form/SmallPrint';
import SubmitButton from '../form/SubmitButton';

export default class Register extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      password: ''
    };
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value, error: undefined });
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value, error: undefined });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value, error: undefined });
  }

  handleSubmit(e) {
    this.setState({ loading: true });
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(user => {
        let db = firebase.firestore();
        db.collection('users').doc(user.uid).set({
          name: this.state.name
        });
      })
      .catch(error => this.setState({ error: error, loading: false }));
    e.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={e => this.handleSubmit(e)} error={this.state.error}>
        <SmallPrint>Trainer name should match Pokémon GO.</SmallPrint>
        <input name="name" type="text" placeholder="Trainer name" required pattern="[a-zA-Z0-9]{4,15}"
          autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
          value={this.state.name} onChange={e => this.handleNameChange(e)} />
        <SmallPrint>Email adress and password do <u>not</u> have to match Pokémon GO!</SmallPrint>
        <EmailInput placeholder="Email address" required
          value={this.state.email} onChange={e => this.handleEmailChange(e)} />
        <PasswordInput required
          value={this.state.password} onChange={e => this.handlePasswordChange(e)} />
        <SubmitButton loading={this.state.loading} />
        <AuthenticationCancel />
      </Form>
    );
  }
}
