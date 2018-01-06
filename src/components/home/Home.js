import React from 'react';
import AuthenticationLinks from '../auth/AuthenticationLinks';

export default function Home(props) {
  let { user } = props;
  return (
    <div>
      {!user && <AuthenticationLinks />}
      Hello {user ? user.name : 'anonymous'}!
    </div>
  );
}
