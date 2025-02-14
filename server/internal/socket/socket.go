package socket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/emilejbm/domino/server/internal/game"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type SocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

var connections = make(map[*websocket.Conn]string)
var connectionsMu sync.Mutex

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // for dev
		// return r.Host == "yourdomain.com"
	},
}

func generateClientID() string {
	return uuid.New().String()
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Println("handling web socket")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	log.Println("path", r.URL.Path)
	clientID := generateClientID()
	connections[conn] = clientID
	defer func() {
		game.PrintAllLobbyInfo()
		connectionsMu.Lock()
		clientID, ok := connections[conn]
		if ok {
			delete(connections, conn)
			game.LobbiesMu.Lock()
			defer game.LobbiesMu.Unlock()
			var leftLobby bool
			for _, lobby := range game.Lobbies {
				for _, player := range lobby.Players {
					if player.ID == clientID {
						lobby.HandleLeaveLobby(clientID)
						if len(lobby.Players) == 0 {
							delete(game.Lobbies, lobby.GameCode)
						}
						leftLobby = true
						break
					}
				}
				if leftLobby {
					break
				}
			}
		}
		connectionsMu.Unlock()
		conn.Close()
		game.PrintAllLobbyInfo()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read msg error", err)
			break
		}

		var msg SocketMessage
		err = json.Unmarshal(message, &msg)
		if err != nil {
			log.Println("Error unmarshaling message:", err)
			continue
		}

		handleSocketMessage(conn, msg, clientID)
	}
}

func handleSocketMessage(conn *websocket.Conn, msg SocketMessage, clientID string) {
	switch msg.Type {
	case "join":
		payload, payloadOk := msg.Payload.(map[string]interface{})
		playerName, nameOk := payload["playerName"].(string)
		lobbyCode, codeOk := payload["lobbyCode"].(string)
		if !payloadOk || !nameOk || !codeOk {
			log.Println("join payload is incorrectly formatted")
			return
		}
		log.Println("player name", playerName, "lobby code", lobbyCode)
		lobby, err := game.GetOrCreateLobby(lobbyCode)
		if err != nil {
			log.Println("error getting / creating lobby", err)
			return
		}
		lobby.HandleJoinLobby(conn, playerName, lobbyCode, clientID)
	case "leave":
		log.Println("got the leave message")
		payload, payloadOk := msg.Payload.(map[string]interface{})
		_, nameOk := payload["playerName"].(string)
		lobbyCode, codeOk := payload["lobbyCode"].(string)
		if !payloadOk || !nameOk || !codeOk {
			log.Println("join payload is incorrectly formatted")
			return
		}
		lobby := game.GetLobby(lobbyCode)
		lobby.HandleLeaveLobby(clientID)
	default:
		log.Println("unknown msg type:", msg.Type, msg.Payload)
	}
}
