import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { FaList, FaArrowsAltH } from 'react-icons/fa';
import Color from './Color';
import VideoComponent from './VideoComponent';
import Comments from './Comments';

const Home = () => {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [colors, setColors] = useState({ bg: 'bg-white', text: 'text-black' });
  const [randomMode, setRandomMode] = useState(true);

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
    for (const upload of uploads) {
      if (!userProfiles[upload.userId]) {
        const userDoc = await getDoc(doc(db, 'users', upload.userId));
        if (userDoc.exists()) {
          profiles[upload.userId] = userDoc.data();
        }
      }
    }
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

  const getCurrentItems = () => {
    const start = currentIndex * itemsPerSlide;
    return filteredUploads.slice(start, start + itemsPerSlide);
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
        alert('Instagram sharing is not supported via web.');
        return;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;
        break;
      case 'tiktok':
        alert('TikTok sharing is not supported via web.');
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const renderSocialButtons = (upload) => (
    <div className="flex space-x-2 mt-2">
      <button onClick={() => openShareModal(upload)}>
        <i className="fas fa-share"></i> Share
      </button>
    </div>
  );

  const toggleRandomMode = () => {
    setRandomMode(!randomMode);
    if (!randomMode) {
      setColors({ bg: 'bg-white', text: 'text-black' });
    }
  };

  return (
    <div className={`container mx-auto p-4 ${colors.bg} ${colors.text}`}>
      <Color setColors={setColors} randomMode={randomMode} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">NEDJEM</h1>
        <button className="text-sm" onClick={toggleRandomMode}>
          {randomMode ? 'Stop Random Mode' : 'Start Random Mode'}
        </button>
        <div className="flex">
          <div className={`w-4 h-4 ${colors.bg}`}></div>
        </div>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for uploads..."
        className="border p-2 mb-4 w-full"
      />
      <div className="text-center p-4 mb-4">
        {uploads.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold">{uploads[bannerIndex]?.title}</h2>
            <p>{uploads[bannerIndex]?.description}</p>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg p-4 mb-4 max-h-96 overflow-y-auto shimmering-border">
        <div className="flex items-center mb-4">
          <FaList className="text-xl mr-2" />
          <h2 className="text-xl font-bold">Vertical List</h2>
        </div>
        <div className="space-y-4">
          {filteredUploads.map(upload => (
            <div key={upload.id} className="rounded-lg p-4 shimmering-border">
              <h2 className="font-bold">{upload.title}</h2>
              <p>{upload.description}</p>
              <div className="flex items-center">
                <img
                  src={userProfiles[upload.userId]?.photoURL || '/default-profile.png'}
                  alt={userProfiles[upload.userId]?.displayName || 'Unknown'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-sm">Posted by: {userProfiles[upload.userId]?.displayName || 'Unknown'}</p>
              </div>
              <button
                onClick={() => handleLike(upload)}
                className={`mt-2 ${likedUploads[upload.id] ? 'text-green-500' : 'text-gray-500'}`}
                disabled={likedUploads[upload.id]}
              >
                <i className={`fas fa-heart ${likedUploads[upload.id] ? 'text-green-500' : ''}`}></i> {upload.likes || 0}
              </button>
              {renderSocialButtons(upload)}
              {upload.videoUrl && (
                <VideoComponent videoUrl={upload.videoUrl} />
              )}
              {upload.imageUrl && (
                <img
                  src={upload.imageUrl}
                  alt="Uploaded"
                  className="w-full mt-2"
                />
              )}
              {upload.pdfUrl && (
                <a
                  href={upload.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 mt-2 block"
                >
                  <i className="fas fa-file-pdf"></i> View PDF
                </a>
              )}
              <button
                onClick={() => toggleDetails(upload.id)}
                className="mt-2 text-blue-600 hover:underline"
              >
                {expandedItems[upload.id] ? 'Hide Details' : 'Show Details'}
              </button>
              {expandedItems[upload.id] && (
                <div className="mt-2">
                  <p>{upload.textContent}</p>
                  <Comments uploadId={upload.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-4 mb-4 shimmering-border">
        <div className="flex items-center mb-4">
          <FaArrowsAltH className="text-xl mr-2" />
          <h2 className="text-xl font-bold">Horizontal Scroll</h2>
        </div>
        <div className="flex overflow-x-auto space-x-4">
          {getCurrentItems().map(upload => (
            <div key={upload.id} className="rounded-lg p-4 w-64 flex-shrink-0 transform hover:scale-105 transition-transform shimmering-border">
              <h2 className="font-bold">{upload.title}</h2>
              <p>{upload.description}</p>
              <div className="flex items-center">
                <img
                  src={userProfiles[upload.userId]?.photoURL || '/default-profile.png'}
                  alt={userProfiles[upload.userId]?.displayName || 'Unknown'}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <p className="text-sm">Posted by: {userProfiles[upload.userId]?.displayName || 'Unknown'}</p>
              </div>
              <button
                onClick={() => handleLike(upload)}
                className={`mt-2 ${likedUploads[upload.id] ? 'text-green-500' : 'text-gray-500'}`}
                disabled={likedUploads[upload.id]}
              >
                <i className={`fas fa-heart ${likedUploads[upload.id] ? 'text-green-500' : ''}`}></i> {upload.likes || 0}
              </button>
              {renderSocialButtons(upload)}
              {upload.videoUrl && (
                <VideoComponent videoUrl={upload.videoUrl} />
              )}
              {upload.imageUrl && (
                <img
                  src={upload.imageUrl}
                  alt="Uploaded"
                  className="w-full mt-2"
                />
              )}
              {upload.pdfUrl && (
                <a
                  href={upload.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 mt-2 block"
                >
                  <i className="fas fa-file-pdf"></i> View PDF
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Share this Upload</h2>
            <div className="flex flex-wrap justify-center space-x-2">
              <button onClick={() => shareLink('facebook')}>
                <i className="fab fa-facebook"></i> Facebook
              </button>
              <button onClick={() => shareLink('twitter')}>
                <i className="fab fa-twitter"></i> Twitter
              </button>
              <button onClick={() => shareLink('instagram')}>
                <i className="fab fa-instagram"></i> Instagram
              </button>
              <button onClick={() => shareLink('whatsapp')}>
                <i className="fab fa-whatsapp"></i> WhatsApp
              </button>
              <button onClick={() => shareLink('tiktok')}>
                <i className="fab fa-tiktok"></i> TikTok
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
