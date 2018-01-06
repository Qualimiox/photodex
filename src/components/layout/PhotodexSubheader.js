import React from 'react';

export default function PhotodexSubheader(props) {
  let { trainer } = props;
  return (
    <div>
      <p style={{ margin: '0', fontWeight: 'bold' }}>{trainer.name}</p>
      <h2 className="Header-subtitle" style={{ margin: '4px 0 0 0' }}>
        Snapped: {Object.keys(trainer.thumbnails).length}
      </h2>
    </div>
  );
}
