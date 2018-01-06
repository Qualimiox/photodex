import React from 'react';

export default function withProps(WrappedComponent, otherProps) {
  return function withPropsComponent(props) {
    return (
      <WrappedComponent {...props} {...otherProps} />
    );
  }
}
