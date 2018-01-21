import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Swipeable from 'react-swipeable';
import { CSSTransitionGroup } from 'react-transition-group';
import { pokedex } from '../../pokedex';
import './Gallery.css';

// Must match transition property in Gallery.css.
const TRANSITION_MS = 300;

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transition: 'to-next'
    };
  }

  componentDidMount() {
    this.scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    this.scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollTop}px`;
    this.listener = e => this.handleKeydown(e);
    document.addEventListener('keydown', this.listener);
  }

  componentWillUnmount() {
    document.body.style.position = null;
    window.scrollTo(this.scrollLeft, this.scrollTop);
    document.removeEventListener('keydown', this.listener);
  }

  handleKeydown(e) {
    switch (e.keyCode) {
      case 37: // left arrow
        return this.slideToPrevious();
      case 39: // right arrow
        return this.slideToNext();
      case 27: // escape
        return this.close();
      default:
        break;
    }
  }

  handleSwipingRight(e, delta) {
    if (delta > 10 && !this.swiping) {
      this.swiping = true;
      this.slideToPrevious();
    }
  }

  handleSwipingLeft(e, delta) {
    if (delta > 10 && !this.swiping) {
      this.swiping = true;
      this.slideToNext();
    }
  }

  handleSwiped() {
    this.swiping = false;
  }

  handleClick(e) {
    if (e.target !== this.galleryBackground) return;
    this.close();
  }

  slideToPrevious() {
    let previousSnap = this.getPrevious();
    if (previousSnap) {
      this.setState({ transition: 'to-previous' });
      this.props.history.push(`/${this.props.trainer.name}/${previousSnap}`);
    } else {
      this.wobble('previous');
    }
  }

  slideToNext() {
    let nextSnap = this.getNext();
    if (nextSnap) {
      this.setState({ transition: 'to-next' });
      this.props.history.push(`/${this.props.trainer.name}/${nextSnap}`);
    } else {
      this.wobble('next');
    }
  }

  close() {
    this.props.history.push(`/${this.props.trainer.name}`);
  }

  getPrevious() {
    return this.getOffset(-1);
  }

  getNext() {
    return this.getOffset(+1);
  }

  getOffset(offset) {
    let { current, snaps } = this.props;
    let orderedSnaps = Object.keys(snaps).sort();
    let currentIndex = orderedSnaps.indexOf(current);
    return currentIndex !== -1 ? orderedSnaps[currentIndex + offset] : undefined;
  }

  wobble(direction) {
    this.setState({ wobbleClass: `to-${direction}-leave` });
    setTimeout(() =>  this.setState({ wobbleClass: '' }), TRANSITION_MS / 5);
  }

  render() {
    let { current, snaps, trainer } = this.props;
    let pokemon = pokedex.find(p => p.number === current);
    let src = snaps[current].gallery;
    let previous = this.getPrevious();
    let next = this.getNext();
    return (
      <Swipeable className="Gallery"
        onSwiped={() => this.handleSwiped()}
        onSwipingRight={(e, delta) => this.handleSwipingRight(e, delta)}
        onSwipingLeft={(e, delta) => this.handleSwipingLeft(e, delta)}
        onClick={e => this.handleClick(e)} innerRef={div => this.galleryBackground = div}>
        <CSSTransitionGroup transitionName={this.state.transition}
          transitionEnterTimeout={TRANSITION_MS} transitionLeaveTimeout={TRANSITION_MS}>
          <img className={`Gallery-snap ${this.state.wobbleClass}`} draggable={false}
            src={src} key={src} alt={pokemon.name} />
        </CSSTransitionGroup>
        <div className="Gallery-preload">
          {previous && <img src={snaps[previous].gallery} alt="Previous" />}
          {next && <img src={snaps[next].gallery} alt="Next" />}
        </div>
        <Link to={`/${trainer.name}`} className="Gallery-close">
          <img src="/assets/close.png" alt="Close" />
        </Link>
      </Swipeable>
    );
  }
}

export default withRouter(Gallery);
