import React from 'react';
import Header from '../components/layout/Header';

export default function withLayout(WrappedComponent) {
  return function withLayoutComponent(props) {
    return (
      <div className="App">
        <div>
          <Header {...props} />
          <div className="App-content">
            <WrappedComponent {...props} />
          </div>
        </div>
      </div>
    );
  }
}
