import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

interface SocketContextValue {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextValue>({
  unreadCount: 0,
  setUnreadCount: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');

    // Disconnect any existing socket when the user logs out
    if (!user || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setUnreadCount(0);
      return;
    }

    // Don't re-create if already connected for this user
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('notification:new', (data: { title: string; message: string }) => {
      toast(`${data.title}: ${data.message}`, { icon: '🔔', duration: 5000 });
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('task_assigned', (data: { task_title: string }) => {
      toast.success(`New task assigned: ${data.task_title}`);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('connect_error', (err) => {
      // Silent — don't spam the user with socket errors
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);