import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { FaList, FaArrowsAltH, FaStar } from 'react-icons/fa';
import VideoComponent from './VideoComponent';
import Chat from './Chat';
import CommentCount from './CommentCount';
import Cadran from './Cadran';
import Map from './Map';
import Notification from './Notification';
import './Home.css';





const Home = () => {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerSlide = 3;
  const [expandedItems, setExpandedItems] = useState({});
  const [bannerIndex, setBannerIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [follows, setFollows] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [likedUploads, setLikedUploads] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [colors] = useState({ bg: 'bg-gray-100', text: 'text-gray-800' });
  const [showContent, setShowContent] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [userLocations, setUserLocations] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchFollows = async () => {
        const q = query(collection(db, 'engagements'), where('userId', '==', user.uid));
        onSnapshot(q, (snapshot) => {
          const followsData = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.type === 'follow') {
              followsData[data.followedUserId] = true;
            }
          });
          setFollows(followsData);
        });
      };
      fetchFollows();
    }
  }, [user]);

  useEffect(() => {
    const q = collection(db, 'uploads');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const uploadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUploads(uploadsData);
      filterUploads(uploadsData);
    });
    return () => unsubscribe();
  }, [follows]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex(prevIndex => (prevIndex + 1) % uploads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [uploads]);

  const filterUploads = (uploadsData) => {
    const filtered = uploadsData.filter(upload =>
      upload.userId === user?.uid || follows[upload.userId]
    );
    setFilteredUploads(filtered);
    fetchUserProfiles(filtered);
  };

  const fetchUserProfiles = async (uploads) => {
    const profiles = {};
    const promises = uploads.map(async (upload) => {
      if (!userProfiles[upload.userId]) {
        const userDoc = await getDoc(doc(db, 'users', upload.userId));
        if (userDoc.exists()) {
          profiles[upload.userId] = {
            displayName: userDoc.data().displayName,
            profilePhotoUrl: userDoc.data().profilePhotoUrl
          };
        }
      }
    });
    await Promise.all(promises);
    setUserProfiles(prev => ({ ...prev, ...profiles }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredUploads(uploads);
    } else {
      const lowerTerm = term.toLowerCase();
      const filtered = uploads.filter(upload => {
        const title = upload.title?.toLowerCase() || '';
        const description = upload.description?.toLowerCase() || '';
        return title.includes(lowerTerm) || description.includes(lowerTerm);
      });
      setFilteredUploads(filtered);
    }
  };

  const toggleDetails = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLike = async (upload) => {
    if (!user) return;

    const docRef = doc(db, 'uploads', upload.id);
    const currentLikes = likedUploads[upload.id];

    if (currentLikes) {
      await updateDoc(docRef, { likes: increment(-1) });
      setLikedUploads(prev => ({ ...prev, [upload.id]: false }));
    } else {
      await updateDoc(docRef, { likes: increment(1) });
      setLikedUploads(prev => ({ ...prev, [upload.id]: true }));
    }

    const updatedLikes = { ...likedUploads, [upload.id]: !currentLikes };
    setLikedUploads(updatedLikes);
    sessionStorage.setItem('likedUploads', JSON.stringify(updatedLikes));
  };

  useEffect(() => {
    const storedLikes = sessionStorage.getItem('likedUploads');
    if (storedLikes) {
      setLikedUploads(JSON.parse(storedLikes));
    }
  }, []);

  const openShareModal = (upload) => {
    setCurrentUpload(upload);
    setShowModal(true);
  };

  const shareLink = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(currentUpload.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'instagram':
        alert('Le partage Instagram n\'est pas supporté via le web.');
        return;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;
        break;
      case 'tiktok':
        alert('Le partage TikTok n\'est pas supporté via le web.');
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const renderSocialButtons = (upload) => (
    <div className="flex space-x-2 mt-2">
      <button onClick={() => openShareModal(upload)} className="flex items-center text-blue-500 hover:text-blue-700">
        <i className="fas fa-share mr-1"></i> Partager
      </button>
    </div>
  );

  useEffect(() => {
    if (user) {
      const fetchLocations = async () => {
        const locations = {};

        navigator.geolocation.getCurrentPosition(
          (position) => {
            locations[user.uid] = [position.coords.latitude, position.coords.longitude];
            setUserLocations(prev => ({ ...prev, ...locations }));
          },
          (error) => {
            console.error("Erreur d'obtention de la localisation de l'utilisateur :", error);
          }
        );

        for (const followedUserId in follows) {
          if (follows[followedUserId]) {
            const userDocRef = doc(db, 'users', followedUserId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.location) {
                locations[followedUserId] = userData.location;
                setUserLocations(prev => ({ ...prev, ...locations }));
              }
            }
          }
        }
      };

      fetchLocations();

      const watchId = navigator.geolocation.watchPosition((position) => {
        const location = [position.coords.latitude, position.coords.longitude];
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { location });
        setUserLocations(prev => ({ ...prev, [user.uid]: location }));
      });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user, follows]);

  const handleBannerClick = (upload) => {
    setCurrentUpload(upload);
    setShowContent(true);
    if (upload.videoUrl) {
      setVideoUrl(upload.videoUrl);
    }
  };

  const renderVerticalList = () => {
    return filteredUploads.map(upload => (
      <div key={upload.id} className="rounded-lg p-4 border border-gray-200 shadow-md hover:border-blue-500 transition">
        <h2 className="font-bold text-lg">{upload.title}</h2>
        <p className="text-sm text-gray-600">{upload.description}</p>
        <CommentCount uploadId={upload.id} />
        <div className="flex items-center space-x-2 mt-2">
          <img
            src={userProfiles[upload.userId]?.profilePhotoUrl || 'default-profile.png'}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <p className="text-sm text-gray-700">{userProfiles[upload.userId]?.displayName || 'Inconnu'}</p>
        </div>
        <button
          onClick={() => handleLike(upload)}
          className={`mt-2 text-lg ${likedUploads[upload.id] ? 'text-red-500' : 'text-gray-500'} hover:scale-110 transition-transform`}
          disabled={likedUploads[upload.id]}
        >
          <i className={`fas fa-heart ${likedUploads[upload.id] ? 'text-red-500' : ''}`}></i> {upload.likes || 0}
        </button>
        {renderSocialButtons(upload)}
        {upload.videoUrl && (
          <VideoComponent videoUrl={upload.videoUrl} />
        )}
        {upload.imageUrl && (
          <img
            src={upload.imageUrl}
            alt="Uploaded"
            className="w-full mt-2 rounded-lg"
          />
        )}
        {upload.pdfUrl && (
          <a
            href={upload.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 mt-2 block"
          >
            <i className="fas fa-file-pdf"></i> Voir le PDF
          </a>
        )}
        <button
          onClick={() => toggleDetails(upload.id)}
          className="mt-2 text-blue-600 hover:underline"
        >
          {expandedItems[upload.id] ? 'Cacher Détails' : 'Voir Détails'}
        </button>
        {expandedItems[upload.id] && (
          <div className="mt-2">
            <p className="text-gray-800">{upload.textContent}</p>
          </div>
        )}
        <Chat uploadId={upload.id} user={user} />
        <div className="mt-2">
          <Map locations={userLocations} highlightedUserId={upload.userId} />
        </div>
      </div>
    ));
  };

  const navigateToChat = (uploadId, messageId) => {
    console.log(`Navigating to chat for upload: ${uploadId}, message: ${messageId}`);
  };

  return (
    <div className={`container mx-auto p-4 ${colors.bg} ${colors.text} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <Cadran />
        <div className="flex space-x-2">
          <FaStar className="text-yellow-500 animate-spin-slow" />
          <FaStar className="text-yellow-500 animate-spin-slow" />
          <FaStar className="text-yellow-500 animate-spin-slow" />
        </div>
        <Notification user={user} navigateToChat={navigateToChat} />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Rechercher des uploads..."
        className="border p-2 mb-4 w-full rounded-lg"
      />
      <div className="text-center p-4 mb-4 bg-white rounded-lg shadow-lg">
        {uploads.length > 0 && (
          <div onClick={() => handleBannerClick(uploads[bannerIndex])} className="cursor-pointer">
            <h2 className="text-2xl font-bold">{uploads[bannerIndex]?.title}</h2>
            <p>{uploads[bannerIndex]?.description}</p>
          </div>
        )}
      </div>
      {showContent && currentUpload && (
        <div className="mb-4">
          {currentUpload.videoUrl && <VideoComponent videoUrl={videoUrl} />}
          <Chat uploadId={currentUpload.id} user={user} />
        </div>
      )}
      <div className="bg-white rounded-lg p-4 mb-4 max-h-96 overflow-y-auto shadow-lg">
        <div className="flex items-center mb-4">
          <FaList className="text-xl mr-2" />
          <h2 className="text-xl font-bold">Liste Verticale</h2>
        </div>
        <div className="space-y-4">
          {renderVerticalList()}
        </div>
      </div>
      <div className="rounded-lg p-4 mb-4 bg-white shadow-lg">
        <div className="flex items-center mb-4">
          <FaArrowsAltH className="text-xl mr-2" />
          <h2 className="text-xl font-bold">Histoires Vidéo</h2>
        </div>
        <div className="flex overflow-x-auto space-x-4">
          {filteredUploads.filter(upload => upload.videoUrl).map(upload => (
            <div key={upload.id} className="rounded-lg p-2 w-64 flex-shrink-0 transform hover:scale-105 transition-transform shadow-md">
              <VideoComponent videoUrl={upload.videoUrl} />
              <div className="flex items-center justify-between mt-2">
                <h2 className="text-sm font-bold">{upload.title}</h2>
                <button
                  onClick={() => handleLike(upload)}
                  className={`text-lg ${likedUploads[upload.id] ? 'text-red-500' : 'text-gray-500'} hover:scale-110 transition-transform`}
                >
                  <i className={`fas fa-heart ${likedUploads[upload.id] ? 'text-red-500' : ''}`}></i> {upload.likes || 0}
                </button>
              </div>
              {renderSocialButtons(upload)}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Partager cet Upload</h2>
            <div className="flex flex-wrap justify-center space-x-2">
              <button onClick={() => shareLink('facebook')} className="text-blue-600 hover:text-blue-800">
                <i className="fab fa-facebook"></i> Facebook
              </button>
              <button onClick={() => shareLink('twitter')} className="text-blue-400 hover:text-blue-600">
                <i className="fab fa-twitter"></i> Twitter
              </button>
              <button onClick={() => shareLink('instagram')} className="text-pink-500 hover:text-pink-700">
                <i className="fab fa-instagram"></i> Instagram
              </button>
              <button onClick={() => shareLink('whatsapp')} className="text-green-500 hover:text-green-700">
                <i className="fab fa-whatsapp"></i> WhatsApp
              </button>
              <button onClick={() => shareLink('tiktok')} className="text-black hover:text-gray-700">
                <i className="fab fa-tiktok"></i> TikTok
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-red-500 hover:text-red-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
