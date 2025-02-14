package game

import (
	"sync"

	"github.com/gorilla/websocket"
)

// ////////////////////////////////// structs ////////////////////////////////////
type Game struct {
	Code          string // Unique game code
	Players       []*Player
	GameBoard     []Domino
	TurnOrder     []string // Order of players' turns
	CurrentTurn   int      // Index of the current player
	State         string   // Game state: "lobby", "waiting", "active", or "completed"
	mu            sync.Mutex
	connections   map[*websocket.Conn]string
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
	ID         string
}

type GameMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// ////////////////////////////////////////////////////////////////////////////////////////
var activeGamesMu sync.Mutex
var activeGames = make(map[string]*Game)

func GetGame(gameCode string) *Game {
	activeGamesMu.Lock()
	defer activeGamesMu.Unlock()
	game, ok := activeGames[gameCode]
	if !ok {
		return nil
	}
	return game
}

func CreateGame() (*Game, error) {
	activeGamesMu.Lock()
	defer activeGamesMu.Unlock()

	newGameCode, err := generateGameCode()
	if err != nil {
		return nil, err
	}
	newGame := &Game{Code: newGameCode, State: "Lobby"}
	activeGames[newGame.Code] = newGame

	return newGame, nil
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

// ------------------ Websocket stuff ------------------ //
