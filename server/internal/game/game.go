package game

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

// ////////////////////////////////// structs ////////////////////////////////////
type Game struct {
	GameCode    string // Unique game code
	GameBoard   *GameBoard
	Players     []*Player
	TurnOrder   []string // Order of players' turns
	CurrentTurn int      // Index of the current player
	State       string   // Game state: "lobby", "waiting", "active", or "completed"
	mu          sync.Mutex
}

type Domino struct {
	SideA int
	SideB int
}

type DominoNode struct {
	Domino *Domino     `json:"domino"`
	Next   *DominoNode `json:"next"`
	Prev   *DominoNode `json:"prev"`
}

type GameBoard struct {
	LeftEnd  *DominoNode `json:"dominoes"` // head
	RightEnd *DominoNode `json:"-"`        // tail
}

type Player struct {
	Name       string
	Hand       []Domino
	IsBot      bool
	Connection *websocket.Conn
	Connected  bool
	ID         string
}

// messages structs

type GameMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type GameInfo struct {
	PlayerNames []string `json:"playerNames"`
	MyHand      []Domino `json:"hand"`
	MyTurn      int      `json:"myTurn" `
}

type UpdatedGameBoard struct {
	GameBoard          []*Domino `json:"gameBoard"`
	TurnToDominoesLeft []int     `json:"dominoesLeft"`
	CurrentTurn        int       `json:"currentTurn"`
	MyHand             []Domino  `json:"hand"`
}

// ////////////////////////////////////////////////////////////////////////////////////////
var ActiveGamesMu sync.Mutex
var ActiveGames = make(map[string]*Game)

// game already has GameCode, Players
// need to establish player turns, fill with bots
func (g *Game) InitGame() {
	g.mu.Lock()
	defer g.mu.Unlock()
	dominoes := shuffleDominoes()

	// fill with bots if needed
	if len(g.Players) < 4 {
		g.fillWithBots()
	}

	// hand out dominoes
	for i, p := range g.Players {
		p.Hand = dominoes[i*7 : ((i + 1) * 7)]
	}

	// assign current turn to person with double six
	g.FindStartingTurn()

	// broadcast slices of dominoes to players
	g.BroadcastGameInfo()

	// broadcast players turn
	g.BroadcastUpdatedGameBoard() // just to send current turn
}

func (g *Game) GameLoop() {

	for {
		currentPlayer := g.Players[g.CurrentTurn]

		if currentPlayer.IsBot {
			g.BotMakeMove(currentPlayer)
		}

	}
}

func (g *Game) MakeMove(player *Player, domino *Domino, preferredSide ...string) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if !g.IsValidMove(domino, player) {
		g.BroadcastInvalidMove(player)
		return
	}

	// remove from hand
	for i, d := range player.Hand {
		if d.SideA == domino.SideA && d.SideB == domino.SideB || d.SideA == domino.SideB && d.SideB == domino.SideA {
			player.Hand = append(player.Hand[:i], player.Hand[i+1:]...)
			break
		}
	}

	newNode := &DominoNode{Domino: domino}

	if g.GameBoard == nil {
		g.GameBoard = &GameBoard{}
	}

	if g.GameBoard.LeftEnd == nil {
		g.GameBoard.AddDominoToRightEnd(newNode)
	} else {
		if domino.SideA == g.GameBoard.RightEnd.Domino.SideB {
			g.GameBoard.AddDominoToRightEnd(newNode)
		} else if domino.SideB == g.GameBoard.RightEnd.Domino.SideB {
			// 'flip' orientation
			domino.SideA, domino.SideB = domino.SideB, domino.SideA
			g.GameBoard.AddDominoToRightEnd(newNode)
		} else if domino.SideA == g.GameBoard.LeftEnd.Domino.SideA {
			g.GameBoard.AddDominoToLeftEnd(newNode)
		} else if domino.SideB == g.GameBoard.LeftEnd.Domino.SideA {
			// 'flip' orientation
			domino.SideA, domino.SideB = domino.SideB, domino.SideA
			g.GameBoard.AddDominoToLeftEnd(newNode)
		}
	}

	g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
	g.BroadcastUpdatedGameBoard()
	if g.IsGameEnd() {
		g.BroadcastGameEnd()
	}
}

func (g *Game) IsValidMove(domino *Domino, player *Player) bool {
	// 1. Check if the player has the domino
	hasDomino := false
	for _, d := range player.Hand {
		if d.SideA == domino.SideA && d.SideB == domino.SideB || d.SideA == domino.SideB && d.SideB == domino.SideA {
			hasDomino = true
			break
		}
	}
	if !hasDomino {
		return false
	}

	// 2. Check if the move is valid according to board rules
	if g.GameBoard == nil || g.GameBoard.LeftEnd == nil { // Empty board
		return true // Any domino can start the game
	}

	leftEnd := g.GameBoard.LeftEnd
	rightEnd := g.GameBoard.RightEnd

	return domino.SideA == rightEnd.Domino.SideB || domino.SideB == rightEnd.Domino.SideB || domino.SideA == leftEnd.Domino.SideA || domino.SideB == leftEnd.Domino.SideA
}

func (g *Game) IsGameEnd() bool {
	if g.GameBoard == nil || g.GameBoard.LeftEnd == nil {
		return false
	}

	// wincon
	for _, player := range g.Players {
		if len(player.Hand) == 0 {
			return true
		}
	}

	if g.someoneCanPlay() {
		return true
	}

	return true // tranke
}

// ------------------ Websocket stuff ------------------ //

// used when starting game or someone is rejoining. lets other users know someone rejoined + the player receives his playing hand.
func (g *Game) BroadcastGameInfo() {

	playerNames := make([]string, len(g.Players))
	for i, p := range g.Players {
		playerNames[i] = p.Name
	}

	for i, player := range g.Players {
		message := GameMessage{Type: "game-info", Payload: GameInfo{
			PlayerNames: playerNames,
			MyHand:      player.Hand,
			MyTurn:      i,
		}}

		jsonMessage, err := json.Marshal(message)
		if err != nil {
			log.Println("error marshaling game-info message")
			return
		}

		if player.Connection != nil {
			if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
				log.Println("Error broadcasting game info:", err)
			}
		}
	}
}

func (g *Game) BroadCastSomeonePassed(p *Player) {
	someonePassedMessage := GameMessage{Type: "someone-passed", Payload: p.Name}
	jsonMessage, err := json.Marshal(someonePassedMessage)
	if err != nil {
		log.Println("error marshaling someone-passed message")
		return
	}
	for _, player := range g.Players {
		if player.Connection != nil {
			if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
				log.Println("Error broadcasting someone-passed:", err)
			}
		}
	}
}

func (g *Game) BroadcastUpdatedGameBoard() {
	if g.GameBoard == nil {
		return
	}

	dominoArray := g.GameBoard.toDominoArray()
	dominoesLeft := make([]int, len(g.Players))
	for i, player := range g.Players {

		dominoesLeft[i] = len(player.Hand)
	}

	for _, player := range g.Players {
		message := GameMessage{Type: "updated-game-board", Payload: UpdatedGameBoard{
			GameBoard:          dominoArray,
			TurnToDominoesLeft: dominoesLeft,
			CurrentTurn:        g.CurrentTurn,
			MyHand:             player.Hand,
		}}

		jsonMessage, err := json.Marshal(message)
		if err != nil {
			log.Println("error marshaling game board:", err)
			return
		}

		if player.Connection != nil {
			if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
				log.Println("Error broadcasting game board:", err)
			}
		}
	}

}

func (g *Game) BroadcastInvalidMove(p *Player) {
	invalidMoveMessage := GameMessage{Type: "invalid-move", Payload: "no"}
	jsonMessage, err := json.Marshal(invalidMoveMessage)
	if err != nil {
		log.Println("error marshaling invalid-move message")
		return
	}
	if p.Connection != nil {
		if err := p.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
			log.Println("Error broadcasting invalid-move:", err)
		}
	}

}

func (g *Game) BroadcastGameEnd() {
	someonePassedMessage := GameMessage{Type: "game-end", Payload: "game ended"} // should send points
	jsonMessage, err := json.Marshal(someonePassedMessage)
	if err != nil {
		log.Println("error marshaling invalid-move message")
		return
	}
	for _, player := range g.Players {
		if player.Connection != nil {
			if err := player.Connection.WriteMessage(websocket.TextMessage, jsonMessage); err != nil {
				log.Println("Error broadcasting invalid-move:", err)
			}
		}
	}
}
