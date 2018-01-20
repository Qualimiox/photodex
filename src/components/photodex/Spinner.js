import React from 'react';

export default function Spinner(props) {
  return (
    <div className="Spinner">
      <i className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>
      <div className="Spinner-status">{props.status}…</div>
    </div>
  );
}
