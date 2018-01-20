import React from 'react';
import { Redirect } from 'react-router-dom';
import { pokedex } from '../../pokedex';
import './Photodex.css';
import Entry from './Entry';
import Gallery from './Gallery';
import Placeholder from './Placeholder';

export default function Photodex(props) {
  let { user, trainer } = props;
  let numberOrMode = props.match.params.numberOrMode;

  if (trainer === null) {
    return (<div>Trainer not found!</div>);
  }

  let editMode = false;
  let current = null;
  let canEdit = user && (user.name === trainer.name);
  if (numberOrMode === 'edit' && canEdit) {
    editMode = true;
  } else if (trainer.snaps[numberOrMode]) {
    current = numberOrMode;
  } else if (numberOrMode) {
    return (<Redirect to={`/${trainer.name}`} />);
  }

  let entries = pokedex.map((pokemon, i) => (
    <Entry key={i} pokemon={pokemon} trainer={trainer} editMode={editMode}
      snap={trainer.snaps[pokemon.number]} />
  ));

  // Placeholders provide a hacky way to ensure that last row of aligns to grid.
  // http://stackoverflow.com/a/22018710
  let placeholders = new Array(20).fill(null).map((_, i) => <Placeholder key={i} />);

  return (
    <div className="Photodex">
      {entries}
      {placeholders}
      {current && <Gallery snaps={trainer.snaps} current={current} trainer={trainer} />}
    </div>
  );
}
