import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from "uuid";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [context, setContext] = useState("lobby");
    const [clientId, setClientID] = useState(localStorage.getItem("clientId"));
    if (!clientId) {
        setClientID(uuidv4());
        localStorage.setItem("clientId", clientId);
    }

    useEffect(() => {
        const connectWebSocket = () => {
            const newSocket = new WebSocket(`ws://localhost:8080/ws?clientId=${clientId}`);
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.onopen = () => {
                console.log("WebSocket connection opened");
            };

            newSocket.onclose = () => {
                console.log("WebSocket connection closed");
                setSocket(null);
            };

            newSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };

    const handleMessage = (event) => {
        const message = JSON.parse(event.data);
    };

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.onmessage = handleMessage;
        }
    }, [context]);

    return (
        <SocketContext.Provider value={{ socket, sendMessage, setContext }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
