import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const VideoCall = ({ currentUser, selectedUser, onClose }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const socket = useRef();

  useEffect(() => {
    socket.current = io('http://localhost:5000'); // Assurez-vous que l'URL correspond à votre serveur Socket.IO

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.current.on('me', (id) => setMe(id));

    socket.current.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.current.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.current.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.current.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-white">Appel vidéo avec {selectedUser.displayName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Votre vidéo</h3>
            <video playsInline muted ref={myVideo} autoPlay className="w-full rounded-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Vidéo de {selectedUser.displayName}</h3>
            <video playsInline ref={userVideo} autoPlay className="w-full rounded-lg" />
          </div>
        </div>
        <div className="flex flex-wrap justify-center mt-4 space-x-2 space-y-2">
          {callAccepted && !callEnded ? (
            <button onClick={leaveCall} className="bg-red-600 text-white rounded px-4 py-2">
              Raccrocher
            </button>
          ) : (
            <button onClick={() => callUser(selectedUser.id)} className="bg-green-600 text-white rounded px-4 py-2">
              Appeler
            </button>
          )}
          <button onClick={onClose} className="bg-gray-600 text-white rounded px-4 py-2">
            Fermer
          </button>
        </div>
        {call.isReceivingCall && !callAccepted && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-white">{call.name} vous appelle</h3>
            <button onClick={answerCall} className="bg-blue-600 text-white rounded px-4 py-2 mt-2">
              Répondre
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
