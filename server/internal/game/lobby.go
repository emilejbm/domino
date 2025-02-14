package game

import (
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ------------------ Structs ------------------ //

type Lobby struct {
	GameCode         string
	Players          []*Player
	game             *Game
	heartbeatTimeout time.Duration
	Mu               sync.Mutex
}

type LobbyMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// ------------------ Global variables ------------------ //

var LobbiesMu sync.Mutex
var Lobbies = make(map[string]*Lobby)

// ------------------ Helper functions ------------------ //

// func GetLobbies() map[string]*Lobby {
// 	return lobbies
// }

// get lobby if it exists, try to create if not
func GetOrCreateLobby(gameCode ...string) (*Lobby, error) {
	LobbiesMu.Lock()
	defer LobbiesMu.Unlock()

	var newGameCode string
	if len(gameCode) > 0 {
		newGameCode = gameCode[0]
	} else {
		var err error
		newGameCode, err = generateGameCode()
		if err != nil {

			return nil, err
		}
	}

	if lobby, ok := Lobbies[newGameCode]; ok {
		return lobby, nil
	}

	newLobby := &Lobby{
		GameCode:         newGameCode,
		Players:          make([]*Player, 0),
		heartbeatTimeout: 120 * time.Second,
	}
	Lobbies[newLobby.GameCode] = newLobby
	return newLobby, nil
}

// mainly for purposes of deletion, check existence
// for other reasons, probably use GetOrCreateLobby
func GetLobby(gameCode string) *Lobby {
	LobbiesMu.Lock()
	defer LobbiesMu.Unlock()
	lobby := Lobbies[gameCode]
	return lobby
}

// ------------------ Websocket stuff ------------------ //

func (l *Lobby) HandleJoinLobby(conn *websocket.Conn, playerName string, lobbyCode string, clientID string) error {
	log.Println("starts")
	l.Mu.Lock()

	log.Println("does not get past this")
	// check if player name already exists
	for _, p := range l.Players {
		if p.Name == playerName {
			return errors.New("player already in game")
		}
	}

	player := &Player{Name: playerName, IsBot: false, Connection: conn, ID: clientID}
	l.Players = append(l.Players, player)
	l.Mu.Unlock()

	l.BroadcastLobbyUpdate()
	return nil
}

func (l *Lobby) HandleLeaveLobby(clientID string) {
	l.Mu.Lock()
	defer l.Mu.Unlock()

	for i, p := range l.Players {
		if p.ID == clientID {
			l.Players = append(l.Players[:i], l.Players[i+1:]...)
			log.Println("Player", p.ID, "left the lobby")
			break
		}
	}
	if len(l.Players) > 0 {
		l.BroadcastLobbyUpdate()
	}
}

// broadcast player names in lobby
func (l *Lobby) BroadcastLobbyUpdate() {
	// l.Mu.Lock()
	// defer l.Mu.Unlock()

	playerNames := make([]string, len(l.Players))
	for i, p := range l.Players {
		playerNames[i] = p.Name
	}

	message := LobbyMessage{Type: "update", Payload: playerNames}
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		log.Println("error marshaling lobby update")
		return
	}

	for _, player := range l.Players {
		if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
			log.Println("Error broadcasting lobby update:", err)
		}
	}
}
