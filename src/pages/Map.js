import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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

const LocationMarker = ({ userLocation, setUserInfo }) => {
  const map = useMapEvents({
    moveend: async () => {
      const center = map.getCenter();
      const { lat, lng } = center;
      
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const { city, country, suburb, neighbourhood, quarter } = response.data.address;
        const neighborhood = suburb || neighbourhood || quarter || 'N/A';
        setUserInfo({ city: city || '', country: country || '', neighborhood });
      } catch (error) {
        console.error("Erreur lors de la récupération de la localisation:", error);
      }
    },
  });

  return userLocation ? <Marker position={userLocation} /> : null;
};

const Map = ({ user, locations, highlightedUserId }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userInfo, setUserInfo] = useState({ city: '', country: '', neighborhood: '' });
  const [connectedUsers, setConnectedUsers] = useState({});

  useEffect(() => {
    const fetchUserData = async (userId) => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    };

    const updateConnectedUsers = async () => {
      const usersData = {};
      for (const userId of Object.keys(locations)) {
        const userData = await fetchUserData(userId);
        if (userData) {
          usersData[userId] = userData;
        }
      }
      setConnectedUsers(usersData);
    };

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            updateDoc(userDocRef, { location: [latitude, longitude], city: userInfo.city || '', country: userInfo.country || '', neighborhood: userInfo.neighborhood });
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération de la position GPS:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      updateConnectedUsers();

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  }, [user, locations, userInfo.city, userInfo.country, userInfo.neighborhood]);

  const getMarkerColor = (distance, isConnectedUser, isCloseUser) => {
    if (isCloseUser) {
      return '#FF00FF'; // Magenta pour l'utilisateur très proche avec appareil
    } else if (isConnectedUser && distance < 0.1) {
      return '#FFFF00'; // Jaune pour l'utilisateur connecté très proche
    } else if (distance < 0.1) {
      return '#FF0000'; // Rouge
    } else if (distance < 0.5) {
      return '#FFA500'; // Orange
    } else if (distance < 1) {
      return '#00FF00'; // Vert
    } else {
      return '#0000FF'; // Bleu
    }
  };

  return (
    <div style={{ height: '250px', width: '100%', marginBottom: '20px' }}>
      {userLocation ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h4>Ville: {userInfo.city}</h4>
            <h4>Pays: {userInfo.country}</h4>
            <h4>Quartier: {userInfo.neighborhood}</h4>
          </div>
          <MapContainer center={userLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker userLocation={userLocation} setUserInfo={setUserInfo} />
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  Vous êtes ici<br />
                  Quartier: {userInfo.neighborhood}<br />
                  Latitude: {userLocation[0]}<br />
                  Longitude: {userLocation[1]}
                </Popup>
              </Marker>
            )}
            {Object.entries(locations).map(([userId, location]) => {
              const distance = haversineDistance(userLocation, location);
              const isConnectedUser = userId === highlightedUserId;
              const isCloseUser = isConnectedUser && connectedUsers[userId] && connectedUsers[userId].hasDevice && distance < 0.1;
              const markerColor = getMarkerColor(distance, isConnectedUser, isCloseUser);

              return (
                <Marker
                  key={userId}
                  position={location}
                  icon={L.divIcon({
                    className: 'my-custom-pin',
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `
                      <span style="background-color: ${markerColor};width: 1.5rem;height: 1.5rem;display: block;border-radius: 50%;opacity: 0.8;border: 2px solid #fff;box-shadow: 0 0 3px #000;"></span>
                      ${isConnectedUser ? '<div class="connected-user-marker"></div>' : ''}
                      ${isCloseUser ? '<div class="close-user-marker"></div>' : ''}
                    `,
                  })}
                >
                  <Popup>
                    {connectedUsers[userId] ? (
                      <>
                        <strong>{connectedUsers[userId].displayName}</strong><br />
                        Quartier: {connectedUsers[userId].neighborhood || 'Inconnu'}<br />
                        Latitude: {location[0]}<br />
                        Longitude: {location[1]}<br />
                        Distance: {distance.toFixed(2)} km<br />
                        <small>Utilisateur connecté</small>
                        {isCloseUser && <small> - Très proche avec appareil</small>}
                      </>
                    ) : (
                      <>
                        <strong>Utilisateur suivi</strong><br />
                        Latitude: {location[0]}<br />
                        Longitude: {location[1]}<br />
                        Distance: {distance.toFixed(2)} km
                      </>
                    )}
                  </Popup>
                  {isConnectedUser && (
                    <Marker
                      position={location}
                      icon={L.divIcon({
                        className: 'user-trail-marker',
                        iconSize: [10, 10],
                        iconAnchor: [5, 5],
                        popupAnchor: [0, -5],
                        html: '<div style="background-color: #00FF00;width: 10px;height: 10px;border-radius: 50%;"></div>',
                      })}
                    />
                  )}
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
