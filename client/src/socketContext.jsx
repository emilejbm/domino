import React, { useState, createContext, useContext, useEffect, useRef } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [context, setContext] = useState("lobby"); // "lobby" or "game"

    useEffect(() => {
        const connectWebSocket = () => {
            console.log("try to connect ws")
            const newSocket = new WebSocket(`ws://localhost:8080/ws`);
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
    }, []); // connect only once

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };

    const handleMessage = (event) => {
        if (context === "lobby") {
            // Handle lobby messages
            const message = JSON.parse(event.data);
            // ... (your lobby message handling logic)
        } else if (context === "game") {
            // Handle game messages
            const message = JSON.parse(event.data);
            // ... (your game message handling logic)
        }
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
