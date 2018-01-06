import React from 'react';

export default function EmailInput(props) {
  let { name, type, placeholder, spellCheck, ...otherProps } = props;
  return (
    <input name={name || 'email'} type="email" placeholder="Email address" spellCheck="false"
      {...otherProps} />
  );
}
