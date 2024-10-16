import React, { useState } from 'react';

const UserSearch = ({ users, setFilteredUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(user =>
      user.displayName.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
    </div>
  );
};

export default UserSearch;
