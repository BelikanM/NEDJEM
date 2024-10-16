import React, { useState, useEffect } from 'react';

function SuggestedProfiles({ users, onSelectUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const results = users.filter(user =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  return (
    <div className="mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-gray-700 text-white rounded p-2 w-full mb-2"
        placeholder="Rechercher des utilisateurs..."
      />
      <div className="overflow-x-auto whitespace-nowrap">
        <div className="inline-flex space-x-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex flex-col items-center">
              <div
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <img
                  src={user.profilePhotoUrl || 'https://via.placeholder.com/128x128.png?text=User'}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
                {user.hasUnreadMessages && (
                  <span className="absolute top-0 right-0 bg-blue-600 rounded-full w-4 h-4" />
                )}
              </div>
              <span className="mt-2 text-xs sm:text-sm font-semibold truncate w-20 sm:w-24 md:w-32 text-center">
                {user.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuggestedProfiles;
