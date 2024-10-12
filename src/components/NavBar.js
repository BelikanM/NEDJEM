import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUpload, FaComments, FaBars, FaTimes } from 'react-icons/fa';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false); // État pour gérer l'ouverture/fermeture de la barre

  // Fonction pour ouvrir/fermer la barre de navigation
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Bouton pour ouvrir/fermer la barre de navigation (Menu hamburger) */}
      <button
        onClick={toggleNav}
        className="fixed bottom-16 right-4 bg-red-600 text-white p-3 rounded-full z-20 shadow-lg md:hidden"
        aria-label="Toggle Navigation"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Barre de navigation */}
      <nav
        className={`fixed bottom-0 left-0 w-full bg-red-600 text-white p-4 shadow-lg flex justify-around items-center transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } md:relative md:translate-y-0 md:w-64 md:h-full md:flex-col md:justify-start`}
      >
        {/* Home Link */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center hover:text-yellow-300 transition-colors duration-300"
          aria-label="Home"
          onClick={() => setIsOpen(false)} // Ferme le menu après clic sur un lien
        >
          <FaHome className="text-2xl" />
          <span className="text-sm mt-1">Home</span>
        </Link>

        {/* Upload Video Link */}
        <Link
          to="/upload"
          className="flex flex-col items-center justify-center hover:text-yellow-300 transition-colors duration-300"
          aria-label="Upload Video"
          onClick={() => setIsOpen(false)} // Ferme le menu après clic sur un lien
        >
          <FaUpload className="text-2xl" />
          <span className="text-sm mt-1">Upload</span>
        </Link>

        {/* Chat Link */}
        <Link
          to="/chat"
          className="flex flex-col items-center justify-center hover:text-yellow-300 transition-colors duration-300"
          aria-label="Chat"
          onClick={() => setIsOpen(false)} // Ferme le menu après clic sur un lien
        >
          <FaComments className="text-2xl" />
          <span className="text-sm mt-1">Chat</span>
        </Link>
      </nav>

      {/* Ajout d'un espace pour ne pas cacher le contenu par la barre de navigation sur mobile */}
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default NavBar;
