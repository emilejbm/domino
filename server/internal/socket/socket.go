package socket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

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

func markClientDisconnected(clientID string, conn *websocket.Conn) {
	connectionsMu.Lock()
	delete(connections, conn)
	connectionsMu.Unlock()

	for _, g := range game.ActiveGames {
		for _, player := range g.Players {
			if player.ID == clientID {
				player.Connected = false
				log.Println("Player", clientID, "disconnected but not removed. Waiting for reconnection...")
				go removeClientAfterTimeout(g, player, 15*time.Second)
				return
			}
		}
	}
}

func removeClientAfterTimeout(g *game.Game, player *game.Player, timeout time.Duration) {
	time.Sleep(timeout)
	game.ActiveGamesMu.Lock()
	defer game.ActiveGamesMu.Unlock()

	if !player.Connected {
		log.Println("Removing player", player.ID, "after timeout")
		g.LeaveGame(player.ID)
		l := game.Lobbies[g.GameCode]
		l.LeaveLobby(player.ID)
	}
}

func checkIfReconnection(conn *websocket.Conn, clientID string) {
	game.ActiveGamesMu.Lock()
	defer game.ActiveGamesMu.Unlock()

	for _, l := range game.Lobbies { // iter through games?
		for _, player := range l.Players {
			if player.ID == clientID {
				log.Println("Player", clientID, "is reconnecting...")
				player.Connection = conn
				player.Connected = true
				return
			}
		}
	}
}

func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	log.Println("handling web socket")
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	clientID := r.URL.Query().Get("clientId")
	if clientID == "" {
		clientID = generateClientID()
	}

	defer func() {
		markClientDisconnected(clientID, conn)
	}()

	connectionsMu.Lock()
	connections[conn] = clientID
	connectionsMu.Unlock()

	// check if client is rejoining
	checkIfReconnection(conn, clientID)

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
	case "join-lobby":
		payload, payloadOk := msg.Payload.(map[string]interface{})
		playerName, nameOk := payload["playerName"].(string)
		lobbyCode, codeOk := payload["lobbyCode"].(string)
		if !payloadOk || !nameOk || !codeOk {
			log.Println("join-lobby payload is incorrectly formatted")
			break
		}
		log.Println("player name", playerName, clientID, "lobby code", lobbyCode)
		lobby, err := game.GetOrCreateLobby(lobbyCode)
		if err != nil {
			log.Println("error getting / creating lobby", err)
			break
		}
		lobby.HandleJoinLobby(conn, playerName, lobbyCode, clientID)

	case "leave-lobby":
		payload, payloadOk := msg.Payload.(map[string]interface{})
		lobbyCode, codeOk := payload["lobbyCode"].(string)
		if !payloadOk || !codeOk {
			log.Println("leave-lobby payload is incorrectly formatted")
			break
		}
		lobby := game.GetLobby(lobbyCode)
		lobby.LeaveLobby(clientID)
		lobby.BroadcastUpdatedLobby()

	case "join-game":
		// not handling joining when user goes directly to the game page. right now assumes he was in lobby before
		payload, payloadOk := msg.Payload.(map[string]interface{})
		gameCode, codeOk := payload["gameCode"].(string)
		if !payloadOk || !codeOk {
			log.Println("join-game payload is incorrectly formatted")
			break
		}

		g, gameExists := game.ActiveGames[gameCode]
		if !gameExists {
			// create game from lobby info
			lobby := game.GetLobby(gameCode)
			if lobby == nil {
				log.Println("lobby is nil")
				// broadcast the game does not exist
				break
			}
			newGame, err := game.CreateGameFromLobby(lobby)
			if err != nil {
				log.Println("something happened creating game")
				break
			}
			log.Println("game did not exist before")
			newGame.BroadcastGameInfo()
		} else {
			log.Println("game already exists")
			g.BroadcastGameInfo()
		}

	case "start-game":
		payload, payloadOk := msg.Payload.(map[string]interface{})
		gameCode, codeOk := payload["gameCode"].(string)
		if !payloadOk || !codeOk {
			log.Println("start-game payload is incorrectly formatted")
			break
		}

		g := game.GetGame(gameCode)
		if g == nil {
			log.Println("no game exists")
			break
		}

		g.InitGame()
		g.BroadcastGameInfo()
		g.BroadcastUpdatedGameBoard()
		go g.GameLoop()

	case "game-action":
		payload, payloadOk := msg.Payload.(map[string]interface{})
		if !payloadOk {
			log.Println("game-action payload is incorrectly formatted")
			break
		}
		g := game.GetPlayersGame(clientID)
		var currPlayer *game.Player
		var playersTurn bool
		for i, p := range g.Players {
			if p.ID == clientID {
				if i != g.CurrentTurn {
					playersTurn = false
				} else {
					playersTurn = true
				}
				currPlayer = p
				break
			}
		}

		if !playersTurn {
			log.Println("skipping game action bc not players turn")
			break
		}

		domino, dominoExists := payload["domino"].(map[string]interface{})
		side, sideExists := payload["side"].(string)
		if !dominoExists || !sideExists {
			log.Println("domino incorrectly formatted", payload)
		}

		LeftSide := int(domino["LeftSide"].(float64))
		RightSide := int(domino["RightSide"].(float64))
		g.MakeMove(currPlayer, &game.Domino{LeftSide: LeftSide, RightSide: RightSide}, side)
		g.SkipPlayers()

	case "play-again":
		g := game.GetPlayersGame(clientID)
		g.RestartGame()
		g.BroadcastGameInfo()
		g.BroadcastUpdatedGameBoard()
		g.Paused = false

	case "leave-game": // entirely handled by defer of HandleWebSocket?
		// payload, payloadOk := msg.Payload.(map[string]interface{})
		// //_, nameOk := payload["playerName"].(string)
		// gameCode, codeOk := payload["gameCode"].(string)
		// if !payloadOk || !codeOk {
		// 	log.Println("leave-lobby payload is incorrectly formatted")
		// 	break
		// }
		// g := game.GetGame(gameCode)
		// g.LeaveGame(clientID)
	// case "make-move":
	// 	payload, payloadOk := msg.Payload.(map[string]interface{})

	default:
		log.Println("unknown msg type:", msg.Type, msg.Payload)
	}
}
