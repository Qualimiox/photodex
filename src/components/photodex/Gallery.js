import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { pokedex } from '../../pokedex';
import './Gallery.css';

class Gallery extends Component {
  componentDidMount() {
    document.body.style.overflow = 'hidden';
    this.listener = e => this.handleKeydown(e);
    document.addEventListener('keydown', this.listener);
  }

  componentWillUnmount() {
    document.body.style.overflow = 'auto';
    document.removeEventListener('keydown', this.listener);
  }

  handleKeydown(e) {
    switch (e.keyCode) {
      case 37: // left arrow
        return this.slideToPreviousSnap();
      case 39: // right arrow
        return this.slideToNextSnap();
      case 27: // escape
        return this.close();
      default:
        break;
    }
  }

  handleClick(e) {
    if (e.target !== this.gallery) return;
    this.close();
  }

  slideToPreviousSnap() {
    let previousSnap = this.getSnap(-1);
    if (previousSnap) {
      this.props.history.push(`/${this.props.trainer.name}/${previousSnap}`);
    }
  }

  slideToNextSnap() {
    let nextSnap = this.getSnap(+1);
    if (nextSnap) {
      this.props.history.push(`/${this.props.trainer.name}/${nextSnap}`);
    }
  }

  close() {
    this.props.history.push(`/${this.props.trainer.name}`);
  }

  getSnap(offset) {
    let { current, snaps } = this.props;
    let orderedSnaps = Object.keys(snaps).sort();
    let currentIndex = orderedSnaps.indexOf(current);
    return currentIndex !== -1 ? orderedSnaps[currentIndex + offset] : undefined;
  }

  render() {
    let { current, snaps, trainer } = this.props;
    let pokemon = pokedex.find(p => p.number === current);
    return (
      <div className="Gallery" onClick={e => this.handleClick(e)} ref={div => this.gallery = div}>
        <img src={snaps[current].gallery} alt={pokemon.name} />
        <Link to={`/${trainer.name}`} className="Gallery-close">
          <img src="/assets/close.png" alt="Close" />
        </Link>
      </div>
    );
  }
}

export default withRouter(Gallery);
