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
	LeftSide  int
	RightSide int
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

// assumes preferredSide is sent by client. client will default to left if not specified by user
// handles swapping of domino in order to fit on table.
// e.g. if left side (top face) of domino is to be played on left end of game table, it needs to be rotated.
// this is handled by swapping the left and right side, client should note so that image names can be fixed
// accordingly (rotated when right is larger than left in this naming convention {left}-{right}).
func (g *Game) MakeMove(player *Player, domino *Domino, preferredSide string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	var madeValidMove bool
	var domoInHand bool
	for _, d := range player.Hand {
		if d.LeftSide == domino.LeftSide && d.RightSide == domino.RightSide || d.LeftSide == domino.RightSide && d.RightSide == domino.LeftSide {
			domoInHand = true
			break
		}
	}
	newNode := &DominoNode{Domino: domino}

	if g.GameBoard == nil {
		g.GameBoard = &GameBoard{}
	}

	if g.GameBoard.LeftEnd == nil {
		g.GameBoard.AddDominoToRightEnd(newNode)
		madeValidMove = true
	} else {
		if preferredSide == "Left" {
			// check if either of the dominos sides fits, if it has to be rotated, swap the order
			if domino.RightSide == g.GameBoard.LeftEnd.Domino.LeftSide {
				g.GameBoard.AddDominoToLeftEnd(newNode)
				madeValidMove = true
			} else if domino.LeftSide == g.GameBoard.LeftEnd.Domino.LeftSide {
				newNode.swapDominoSides()
				g.GameBoard.AddDominoToLeftEnd(newNode)
				madeValidMove = true
			}
		} else if preferredSide == "Right" {
			if domino.LeftSide == g.GameBoard.RightEnd.Domino.RightSide {
				g.GameBoard.AddDominoToRightEnd(newNode)
				madeValidMove = true
			} else if domino.RightSide == g.GameBoard.RightEnd.Domino.RightSide {
				newNode.swapDominoSides()
				g.GameBoard.AddDominoToRightEnd(newNode)
				madeValidMove = true
			}
		}
	}

	if !(domoInHand && madeValidMove) {
		log.Println("not valid move", domoInHand, madeValidMove)
		return
	}

	// remove from hand
	for i, d := range player.Hand {
		if d.LeftSide == domino.LeftSide && d.RightSide == domino.RightSide || d.LeftSide == domino.RightSide && d.RightSide == domino.LeftSide {
			player.Hand = append(player.Hand[:i], player.Hand[i+1:]...)
			break
		}
	}
	g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
	g.BroadcastUpdatedGameBoard()

	if g.IsGameEnd() {
		log.Println("does go in here")
		g.BroadcastGameEnd()
	}
}

func (g *Game) IsValidMove(domino *Domino, player *Player) bool {
	hasDomino := false
	for _, d := range player.Hand {
		if d.LeftSide == domino.LeftSide && d.RightSide == domino.RightSide || d.LeftSide == domino.RightSide && d.RightSide == domino.LeftSide {
			hasDomino = true
			break
		}
	}
	if !hasDomino {
		return false
	}

	if g.GameBoard == nil || g.GameBoard.LeftEnd == nil {
		return true // any domino can start the game
	}

	leftEnd := g.GameBoard.LeftEnd
	rightEnd := g.GameBoard.RightEnd

	return domino.LeftSide == rightEnd.Domino.RightSide || domino.RightSide == rightEnd.Domino.RightSide || domino.LeftSide == leftEnd.Domino.LeftSide || domino.RightSide == leftEnd.Domino.LeftSide
}

func (g *Game) SkipPlayers() {
	g.mu.Lock()
	defer g.mu.Unlock()

	skipCounter := 0
	for {
		if skipCounter > 3 {
			g.BroadcastGameEnd()
			return
		}

		playerPassed := true
		p := g.Players[g.CurrentTurn]
		leftEnd := g.GameBoard.LeftEnd.Domino.LeftSide
		rightEnd := g.GameBoard.RightEnd.Domino.RightSide

		for _, domo := range p.Hand {
			if (domo.LeftSide == leftEnd) || (domo.RightSide == leftEnd) || (domo.RightSide == rightEnd) || (domo.LeftSide == rightEnd) {
				playerPassed = false
				return
			}
		}
		if playerPassed {
			g.BroadCastSomeonePassed(p)
		}

		skipCounter += 1
		g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
	}
}

func (g *Game) IsGameEnd() bool {
	log.Println("checking is game end")
	if g.GameBoard == nil || g.GameBoard.LeftEnd == nil {
		return false
	}

	// wincon
	for _, player := range g.Players {
		log.Println(player.Hand)
		if len(player.Hand) == 0 {
			return true
		}
	}

	if !g.someoneCanPlay() {
		return true
	}

	return true
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
	someonePassedMessage := GameMessage{Type: "game-ended", Payload: "game ended"} // should send points
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
