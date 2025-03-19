import { useState, createContext, useContext, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from "uuid";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [context, setContext] = useState("lobby");
    const [clientId, setClientID] = useState(null);

    useEffect(() => {
        const connectWebSocket = (currClientID) => {
            const newSocket = new WebSocket(`ws://localhost:8080/ws?clientId=${currClientID}`);
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.onopen = () => {
            };

            newSocket.onclose = () => {
                setSocket(null);
            };

            newSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        };

        const storedClientId = localStorage.getItem("clientId");
        if (storedClientId) {
            setClientID(storedClientId);
            connectWebSocket(storedClientId);
        } else {
            const newClientId = uuidv4();
            localStorage.setItem("clientId", newClientId);
            setClientID(newClientId);
            connectWebSocket(newClientId);
        }

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
