import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaCamera, FaUserCircle, FaVideo, FaImage, FaFilePdf, FaSignOutAlt, FaGoogle, FaTrash } from 'react-icons/fa';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [follows, setFollows] = useState({});
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPhotos = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfilePhotoUrl(data.profilePhotoUrl || '');
          setCoverPhotoUrl(data.coverPhotoUrl || '');
        }
      };
      fetchPhotos();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'uploads'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const uploadsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUploads(uploadsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData.filter(u => u.id !== user?.uid));
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchEngagements = async () => {
      if (user) {
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
      }
    };

    fetchEngagements();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', loggedInUser.uid), {
          displayName: loggedInUser.displayName,
          profilePhotoUrl: loggedInUser.photoURL || '',
          coverPhotoUrl: '',
        });
      }
    } catch (error) {
      console.error("Erreur d'authentification: ", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleUpload = async () => {
    if (!file && !imageFile && !pdfFile) return;

    const urls = {};

    if (file) {
      const storageRef = ref(storage, `uploads/videos/${file.name}`);
      await uploadBytes(storageRef, file);
      urls.videoUrl = await getDownloadURL(storageRef);
    }

    if (imageFile) {
      const imageRef = ref(storage, `uploads/images/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);
      urls.imageUrl = await getDownloadURL(imageRef);
    }

    if (pdfFile) {
      const pdfRef = ref(storage, `uploads/pdfs/${pdfFile.name}`);
      await uploadBytes(pdfRef, pdfFile);
      urls.pdfUrl = await getDownloadURL(pdfRef);
    }

    await addDoc(collection(db, 'uploads'), {
      title,
      description,
      videoUrl: urls.videoUrl || '',
      imageUrl: urls.imageUrl || '',
      pdfUrl: urls.pdfUrl || '',
      textContent,
      userId: user.uid,
      createdAt: new Date(),
    });

    setTitle('');
    setDescription('');
    setFile(null);
    setImageFile(null);
    setPdfFile(null);
    setTextContent('');
  };

  const handlePhotoUpload = async (photo, type) => {
    if (!photo) return;
    const photoRef = ref(storage, `profile/${type}/${photo.name}`);
    await uploadBytes(photoRef, photo);
    const photoUrl = await getDownloadURL(photoRef);

    const userDocRef = doc(db, 'users', user.uid);
    if (type === 'profile') {
      setProfilePhotoUrl(photoUrl);
      await updateDoc(userDocRef, { profilePhotoUrl: photoUrl });
    } else if (type === 'cover') {
      setCoverPhotoUrl(photoUrl);
      await updateDoc(userDocRef, { coverPhotoUrl: photoUrl });
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'uploads', id));
  };

  const toggleFollow = async (uploadUserId) => {
    const followRef = doc(db, 'engagements', `${uploadUserId}_${user.uid}_follow`);
    const docSnap = await getDoc(followRef);
    if (docSnap.exists()) {
      await deleteDoc(followRef);
      setFollows((prev) => ({ ...prev, [uploadUserId]: false }));
    } else {
      await setDoc(followRef, { followedUserId: uploadUserId, userId: user.uid, type: 'follow' });
      setFollows((prev) => ({ ...prev, [uploadUserId]: true }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Nav Bar */}
      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
        <h1 className="text-xl font-bold">
          {user ? user.displayName : 'Profile Page'}
        </h1>
        {user ? (
          <button onClick={handleLogout} className="bg-red-500 flex items-center gap-2 px-4 py-2 rounded">
            <FaSignOutAlt /> Logout
          </button>
        ) : (
          <button onClick={handleLogin} className="bg-green-500 flex items-center gap-2 px-4 py-2 rounded">
            <FaGoogle /> Login with Google
          </button>
        )}
      </nav>

      {/* Profile & Cover Photo */}
      <div className="relative mt-4">
        <div className="relative">
          {coverPhotoUrl ? (
            <img
              src={coverPhotoUrl}
              alt="Cover"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg shadow-md"></div>
          )}
          <label className="absolute top-2 right-2 cursor-pointer">
            <FaCamera className="text-white bg-black rounded-full p-1" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files[0], 'cover')}
              className="hidden"
            />
          </label>
        </div>
        <div className="relative">
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white absolute top-[-4rem] left-4 shadow-lg"
            />
          ) : (
            <FaUserCircle className="w-32 h-32 rounded-full border-4 border-white absolute top-[-4rem] left-4 shadow-lg text-gray-400" />
          )}
          <label className="absolute top-0 left-24 cursor-pointer">
            <FaCamera className="text-white bg-black rounded-full p-1" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files[0], 'profile')}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Section */}
      {user && (
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Upload Content</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            />
            <textarea
              placeholder="Write your text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="border p-2 w-full mb-2 rounded"
              rows="4"
            ></textarea>

            <div className="flex justify-between items-center my-4">
              <label className="cursor-pointer flex items-center gap-2">
                <FaVideo className="text-blue-500" />
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <span>Upload Video/Audio</span>
              </label>

              <label className="cursor-pointer flex items-center gap-2">
                <FaImage className="text-green-500" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="hidden"
                />
                <span>Upload Image</span>
              </label>

              <label className="cursor-pointer flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="hidden"
                />
                <span>Upload PDF</span>
              </label>
            </div>

            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-md w-full"
            >
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Uploads Section */}
      {user && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">Your Uploads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploads.map((upload) => (
              <div key={upload.id} className="bg-white shadow-lg rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-gray-400" />
                  )}
                  <h3 className="font-bold">{upload.title}</h3>
                </div>
                <p>{upload.description}</p>
                {upload.videoUrl && (
                  <video controls src={upload.videoUrl} className="w-full mt-2 rounded-lg" />
                )}
                {upload.imageUrl && (
                  <img src={upload.imageUrl} alt="Uploaded" className="w-full mt-2 rounded-lg" />
                )}
                {upload.pdfUrl && (
                  <a
                    href={upload.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 mt-2 inline-block"
                  >
                    <FaFilePdf /> View PDF
                  </a>
                )}
                <p className="mt-2">{upload.textContent}</p>

                <div className="flex justify-end items-center mt-4">
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="bg-red-500 text-white flex items-center gap-2 px-4 py-2 rounded shadow"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Section */}
      {user && (
        <div className="mt-8">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <h2 className="text-lg font-bold mb-4">Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
            {users
              .filter((u) => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((user) => (
                <div key={user.id} className="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {user.profilePhotoUrl ? (
                      <img
                        src={user.profilePhotoUrl}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <FaUserCircle className="w-8 h-8 text-gray-400" />
                    )}
                    <span>{user.displayName}</span>
                  </div>
                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`px-4 py-2 rounded shadow ${
                      follows[user.id] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                    }`}
                  >
                    {follows[user.id] ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
