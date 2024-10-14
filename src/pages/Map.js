import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const haversineDistance = (coords1, coords2) => {
  const toRad = (angle) => (Math.PI / 180) * angle;
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Map = ({ user, locations, highlightedUserId }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userInfo, setUserInfo] = useState({ city: '', country: '', neighborhood: '' });

  useEffect(() => {
    const fetchLocation = async (latitude, longitude) => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const { city, country_name } = response.data;
        setUserLocation([latitude, longitude]);
        setUserInfo({ city, country: country_name });

        const openCageResponse = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=b787245781bc478083f45901e17fc474`
        );

        if (openCageResponse.status === 200 && openCageResponse.data.results.length > 0) {
          const components = openCageResponse.data.results[0].components;
          const neighborhood = components.suburb || components.neighbourhood || components.quarter || 'N/A';
          setUserInfo(prev => ({ ...prev, neighborhood }));
        } else {
          console.error("Erreur OpenCage:", openCageResponse.status, openCageResponse.data);
        }

        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { location: [latitude, longitude] });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la localisation:", error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchLocation(latitude, longitude);
        },
        (error) => {
          console.error("Erreur lors de la récupération de la position GPS:", error);
        }
      );
    } else {
      console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  }, [user]);

  return (
    <div style={{ height: '250px', width: '100%', marginBottom: '20px' }}>
      {userLocation ? (
        <>
          <p>Ville: {userInfo.city}, Pays: {userInfo.country}, Quartier: {userInfo.neighborhood}</p>
          <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={userLocation}>
              <Popup>
                Votre position approximative<br />
                Latitude: {userLocation[0]}<br />
                Longitude: {userLocation[1]}
              </Popup>
            </Marker>
            {Object.entries(locations).map(([userId, location]) => {
              const distance = haversineDistance(userLocation, location);
              return (
                <Marker key={userId} position={location}>
                  <Popup>
                    {userId === highlightedUserId ? "Vous êtes ici" : "Utilisateur suivi"}<br />
                    Latitude: {location[0]}<br />
                    Longitude: {location[1]}<br />
                    Distance: {distance.toFixed(2)} km
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </>
      ) : (
        <p>Chargement de la localisation...</p>
      )}
    </div>
  );
};

export default Map;
