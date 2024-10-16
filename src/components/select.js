// src/components/select.js
import React from 'react';

const SelectUser = ({ users, onSelect }) => {
  return (
    <div>
      <h3>Sélectionnez un utilisateur</h3>
      <select onChange={e => onSelect(e.target.value)}>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectUser;
