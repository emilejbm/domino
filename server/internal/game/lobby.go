package game

import (
	"encoding/json"
	"errors"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ------------------ Structs ------------------ //

type Lobby struct {
	GameCode         string
	Players          []*Player
	heartbeatTimeout time.Duration
	Mu               sync.Mutex
}

type LobbyMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// ------------------ Global variables ------------------ //

var ActiveLobbiesMu sync.Mutex
var ActiveLobbies = make(map[string]*Lobby)

// ------------------ Helper functions ------------------ //

// get lobby if it exists, try to create if not
func GetOrCreateLobby(gameCode ...string) (*Lobby, error) {
	ActiveLobbiesMu.Lock()
	defer ActiveLobbiesMu.Unlock()

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

	if lobby, ok := ActiveLobbies[newGameCode]; ok {
		return lobby, nil
	}

	newLobby := &Lobby{
		GameCode:         newGameCode,
		Players:          make([]*Player, 0),
		heartbeatTimeout: 120 * time.Second,
	}
	ActiveLobbies[newLobby.GameCode] = newLobby
	return newLobby, nil
}

// mainly for purposes of deletion, check existence
// for other reasons, probably use GetOrCreateLobby
func GetLobby(gameCode string) *Lobby {
	ActiveLobbiesMu.Lock()
	defer ActiveLobbiesMu.Unlock()
	lobby := ActiveLobbies[gameCode]
	return lobby
}

func (l *Lobby) RemoveFromActiveLobbies() {
	ActiveLobbiesMu.Lock()
	defer ActiveLobbiesMu.Unlock()

	delete(ActiveLobbies, l.GameCode)
}

func (l *Lobby) IsEmpty() bool {
	for _, p := range l.Players {
		if !strings.HasPrefix(p.Name, "Bot-") {
			return false
		}
	}
	return true
}

// ------------------ Websocket stuff ------------------ //

func (l *Lobby) HandleJoinLobby(conn *websocket.Conn, playerName string, lobbyCode string, clientID string) error {
	l.Mu.Lock()
	defer l.Mu.Unlock()

	// check if player name already exists
	for _, p := range l.Players {
		if p.Name == playerName {
			// maybe not error in case player was just rejoining?
			l.BroadcastUpdatedLobby()
			return errors.New("player already in game")
		}
	}

	player := &Player{Name: playerName, IsBot: false, Connection: conn, ID: clientID}
	l.Players = append(l.Players, player)

	l.BroadcastUpdatedLobby()
	return nil
}

func (l *Lobby) LeaveLobby(clientID string) {
	for i, p := range l.Players {
		if clientID == p.ID {
			l.Players = append(l.Players[:i], l.Players[i+1:]...)
			log.Println("Player", p.ID, "left the lobby")
			break
		}
	}

	l.BroadcastUpdatedLobby()
}

// broadcast player names in lobby
func (l *Lobby) BroadcastUpdatedLobby() {
	playerNames := make([]string, len(l.Players))
	for i, p := range l.Players {
		playerNames[i] = p.Name
	}

	message := LobbyMessage{Type: "players-in-lobby", Payload: playerNames}
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
