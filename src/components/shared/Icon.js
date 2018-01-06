import React from 'react';

export default function Icon(props) {
  let { icon } = props;
  return (
    <i className={`fa fa-${icon}`} aria-hidden="true"></i>
  );
}
