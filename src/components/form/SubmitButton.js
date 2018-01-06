import React from 'react';
import './SubmitButton.css';

export default function SubmitButton(props) {
  let { loading, children } = props;
  return (
    <button className="SubmitButton" type="submit" disabled={loading}>
      {children || 'Go!'}
    </button>
  );
}
