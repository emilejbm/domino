package game

import (
	"encoding/json"
	"errors"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// ////////////////////////////////// structs ////////////////////////////////////
type Game struct {
	GameCode      string // Unique game code
	Players       []*Player
	GameBoard     []Domino
	TurnOrder     []string // Order of players' turns
	CurrentTurn   int      // Index of the current player
	State         string   // Game state: "lobby", "waiting", "active", or "completed"
	mu            sync.Mutex
	connectionsMu sync.Mutex
}

type Domino struct {
	Left  int
	Right int
}

type Player struct {
	Name       string
	Hand       []Domino
	IsBot      bool
	Connection *websocket.Conn
	Connected  bool
	ID         string
}

type GameMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type GameStartMessage struct {
	Type string `json:"type"`
	Hand string `json:""`
}

// ////////////////////////////////////////////////////////////////////////////////////////
var ActiveGamesMu sync.Mutex
var ActiveGames = make(map[string]*Game)

func GetGame(gameCode string) *Game {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()
	game, ok := ActiveGames[gameCode]
	if !ok {
		return nil
	}
	return game
}

func CreateGameFromLobby(lobby *Lobby) (*Game, error) {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()
	if lobby == nil {
		return nil, errors.New("lobby is nil")
	}
	newGame := &Game{GameCode: lobby.GameCode, Players: lobby.Players, State: "not-started"}
	ActiveGames[newGame.GameCode] = newGame
	return newGame, nil
}

func CreateGame(gameCode ...string) (*Game, error) {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()

	newGameCode, err := generateGameCode()
	if err != nil {
		return nil, err
	}
	newGame := &Game{GameCode: newGameCode, State: "Lobby"}
	ActiveGames[newGame.GameCode] = newGame

	return newGame, nil
}

func (g *Game) LeaveGame(clientID string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	for i, p := range g.Players {
		if clientID == p.ID {
			g.Players = append(g.Players[:i], g.Players[i+1:]...)
			log.Println("Player", p.ID, "left the game")
			break
		}
	}

	g.BroadcastGameState()
}

// game already has GameCode, Players
// need to establish player turns, fill with bots
func (g *Game) InitGame() {
	g.mu.Lock()
	defer g.mu.Unlock()
	dominoes := shuffleDominoes()

	// fill with bots if needed

	// hand out dominoes
	for i, p := range g.Players {
		p.Hand = dominoes[i*7 : ((i + 1) * 7)] // not sure if hand is already init
	}

	// assign current turn to person with double six
	startingPlayer := g.GetPlayerWithDoubleSix()
	for i, p := range g.Players {
		if p == startingPlayer {
			g.CurrentTurn = i
		}
	}

	// broadcast slices of dominoes to players
	g.BroadcastGameStart()

	// broadcast players turn
	g.BroadcastYourTurn()
}

// ------------------ Websocket stuff ------------------ //

// broadcast player names to each player
func (g *Game) BroadcastGameState() {
	playerNames := make([]string, len(g.Players))
	for i, p := range g.Players {
		playerNames[i] = p.Name
	}

	message := LobbyMessage{Type: "player-names", Payload: playerNames}
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		log.Println("error marshaling lobby update")
		return
	}

	for _, player := range g.Players {
		if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
			log.Println("Error broadcasting game state:", err)
		}
	}

}

func (g *Game) BroadcastGameStart() {
	for _, player := range g.Players {
		message := GameMessage{Type: "player-hand", Payload: player.Hand}
		jsonMessage, err := json.Marshal(message)
		if err != nil {
			log.Println("error marshaling player-hand message")
			return
		}

		if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
			log.Println("Error broadcasting game start:", err)
		}
	}
}

// func (g *Game) IsValidMove(domino Domino, player *Player) bool {
// 	if !containsDomino(player.Hand, domino) {
// 		return false
// 	}

// 	if len(g.GameBoard) == 0 {
// 		return true // any domino
// 	}

// 	lastDomino := g.GameBoard[len(g.GameBoard)-1]
// 	firstDomino := g.GameBoard[0]

// 	return domino.Left == lastDomino.Right || domino.Right == lastDomino.Left || domino.Left == firstDomino.Left || domino.Right == firstDomino.Right
// }

// func (g *Game) MakeMove(player *Player, domino Domino) {
// 	if !g.IsValidMove(domino, player) {
// 		// Handle invalid move (e.g., send message to player)
// 		return
// 	}

// 	if domino.Left == g.GameBoard[len(g.GameBoard)-1].Right {
// 		g.GameBoard = append(g.GameBoard, domino)
// 	} else if domino.Right == g.GameBoard[len(g.GameBoard)-1].Right {
// 		domino.Left, domino.Right = domino.Right, domino.Left
// 		g.GameBoard = append(g.GameBoard, domino)
// 	} else if domino.Left == g.GameBoard[0].Left {
// 		domino.Left, domino.Right = domino.Right, domino.Left
// 		g.GameBoard = append([]Domino{domino}, g.GameBoard...)
// 	} else if domino.Right == g.GameBoard[0].Left {
// 		g.GameBoard = append([]Domino{domino}, g.GameBoard...)
// 	}

//
// 	for i, d := range player.Hand {
// 		if d == domino || (d.Left == domino.Right && d.Right == domino.Left) {
// 			player.Hand = append(player.Hand[:i], player.Hand[i+1:]...)
// 			break
// 		}
// 	}

// 	g.BroadcastGameState()
// }

// func (g *Game) BotMakeMove(bot *Player) {
// 	for _, domino := range bot.Hand {
// 		if g.IsValidMove(domino, bot) {
// 			g.MakeMove(bot, domino)
// 			g.BroadcastGameState()
// 			return
// 		}
// 	}
//
// }

func (g *Game) GameLoop() {

	//g.InitGame()
	for {
		// currentPlayer := g.Players[g.CurrentTurn]

		// Update current turn (counter-clockwise)
		// g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)

		// g.BroadcastGameState()

		// if game ended {
		//     break
		// }
	}
}

// only broadcasting to one person
func (g *Game) BroadcastYourTurn() {
	for i, player := range g.Players {
		if i == g.CurrentTurn {
			yourTurnMessage := GameMessage{Type: "alert-turn", Payload: nil}
			jsonMessage, err := json.Marshal(yourTurnMessage)
			if err != nil {
				log.Println("error marshaling alert-turn message")
				return
			}
			if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
				log.Println("Error broadcasting turn:", err)
			}
		}
	}

}

func (g *Game) BroadcastRoundEnd() {

}

func (g *Game) BroadcastGameEnd() {

}

func (g *Game) BroadcastMove() {

}

func (g *Game) BroadcastInvalidMove() {

}
