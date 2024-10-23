import React from 'react';
import { FaStar } from 'react-icons/fa'; // Import de l'icône étoile
import styles from './Cadran.module.css'; // Import des styles CSS modules

const Cadran = () => (
  <div className={styles.container}>
    <div className={styles.cadran}>
      {/* Grande étoile bleue tournante */}
      <FaStar className={styles.star} />
    </div>
    {/* Texte Starviews en dessous du cadran */}
    <span className={styles.text}>Starviews</span>
  </div>
);

export default Cadran;
