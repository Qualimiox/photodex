import alertify from 'alertify.js';
import firebase from 'firebase';
import React, { Component } from 'react';
import AuthenticationCancel from './AuthenticationCancel';
import EmailInput from '../form/EmailInput';
import Form from '../form/Form';
import SmallPrint from '../form/SmallPrint';
import SubmitButton from '../form/SubmitButton';

export default class ResetPassword extends Component {
  constructor(props) {
    super();
    this.state = {
      email: props.location.state && props.location.state.email
    };
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value, error: undefined });
  }

  handleSubmit(e) {
    this.setState({ loading: true });
    firebase.auth().sendPasswordResetEmail(this.state.email)
      .then(() => {
        alertify.alert('A password reset email has been sent.')
        this.props.history.push('/auth/sign-in');
      })
      .catch(error => this.setState({ error: error, loading: false }));
    e.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={e => this.handleSubmit(e)} error={this.state.error}>
        <SmallPrint>An email will be sent with password reset instructions.</SmallPrint>
        <EmailInput autoFocus required
          value={this.state.email} onChange={e => this.handleEmailChange(e)} />
        <SubmitButton loading={this.state.loading}>Reset</SubmitButton>
        <AuthenticationCancel />
      </Form>
    );
  }
}
