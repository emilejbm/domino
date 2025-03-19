package game

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ////////////////////////////////// structs ////////////////////////////////////
type Game struct {
	GameCode          string
	GameBoard         *GameBoard
	Players           []*Player
	CurrentTurn       int
	StartingMove      Move
	Points            [2]int
	LatestWinningTeam int
	LatestWinner      *Player
	PlayerMoveMu      sync.Mutex
	MovesSoFar        []*Domino
	Paused            bool

	mu sync.Mutex
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
	mu       sync.Mutex
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
	StartingMove       Move      `json:"startingMove"`
	MyHand             []Domino  `json:"hand"`
	MovesSoFar         []*Domino `json:"movesSoFar"`
}

type Move struct {
	Domino    *Domino `json:"domino"`
	PlayerIdx int     `json:"playerIdx"`
}

type GameEndStats struct {
	WinningTeam int    `json:"winningTeam"` // just an index. 0 for team A (players 0 and 2), 1 for team B (players 1, 3)
	RoundPoints int    `json:"roundPoints"`
	PointsSoFar [2]int `json:"pointsSoFar"`
}

// ////////////////////////////////////////////////////////////////////////////////////////
var ActiveGamesMu sync.Mutex
var ActiveGames = make(map[string]*Game)

// game already has GameCode, Players
// need to establish player turns, fill with bots
func (g *Game) InitGame() {
	dominoes := shuffleDominoes()

	// fill with bots if needed
	if len(g.Players) < 4 {
		g.fillWithBots()
	}

	// hand out dominoes
	for i, p := range g.Players {
		p.Hand = dominoes[i*7 : ((i + 1) * 7)]
	}

	g.FindStartingTurn()

}

func (g *Game) RestartGame() {
	g.GameBoard.ClearGameBoard()
	g.InitGame()
	g.MovesSoFar = g.MovesSoFar[:0]
}

func (g *Game) GameLoop() {

	for {

		if !g.Paused {
			currentPlayer := g.Players[g.CurrentTurn]

			if currentPlayer.IsBot {
				g.BotMakeMove(currentPlayer)
				time.Sleep(1 * time.Second)
			}
		}

	}
}

// assumes preferredSide is sent by client. client will default to left if not specified by user
// handles swapping of domino in order to fit on table.
// e.g. if left side (top face) of domino is to be played on left end of game table, it needs to be rotated.
// this is handled by swapping the left and right side, client should note so that image names can be fixed
// accordingly (rotated when right is larger than left in this naming convention {left}-{right}).
func (g *Game) MakeMove(player *Player, domino *Domino, preferredSide string) {
	g.PlayerMoveMu.Lock()
	defer g.PlayerMoveMu.Unlock()

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
		g.GameBoard.AddDominoToLeftEnd(newNode)
		madeValidMove = true
		for i, p := range g.Players {
			if p == player {
				log.Println("this is getting called!!!!!!")
				g.StartingMove = Move{Domino: domino, PlayerIdx: i}
			}
		}
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

	// remove from hand + add to game history
	for i, d := range player.Hand {
		if d.LeftSide == domino.LeftSide && d.RightSide == domino.RightSide || d.LeftSide == domino.RightSide && d.RightSide == domino.LeftSide {
			g.MovesSoFar = append(g.MovesSoFar, &d)
			player.Hand = append(player.Hand[:i], player.Hand[i+1:]...)
			break
		}
	}
	g.mu.Lock()
	g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
	g.mu.Unlock()
	g.BroadcastUpdatedGameBoard()

	if g.IsGameEnd() {
		g.Paused = true
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
	skipCounter := 0
	for {
		if skipCounter > 2 {
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
			skipCounter += 1
			g.MovesSoFar = append(g.MovesSoFar, nil)
			g.BroadCastSomeonePassed(p)
		}

		g.mu.Lock()
		g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
		g.mu.Unlock()
	}
}

func (g *Game) IsGameEnd() bool {
	log.Println("checking is game end")
	if g.GameBoard == nil || g.GameBoard.LeftEnd == nil {
		return false
	}

	for _, player := range g.Players {
		log.Println(player.Hand)
		if len(player.Hand) == 0 {
			return true
		}
	}

	return !g.someoneCanPlay()
}

// ------------------ Websocket stuff ------------------ //

// used when starting game or someone is rejoining. lets other users know someone rejoined + the player receives his playing hand.
func (g *Game) BroadcastGameInfo() {
	g.mu.Lock()
	defer g.mu.Unlock()

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
	g.mu.Lock()
	defer g.mu.Unlock()

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
	g.mu.Lock()
	defer g.mu.Unlock()

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
			StartingMove:       g.StartingMove,
			MovesSoFar:         g.MovesSoFar,
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
	g.mu.Lock()
	defer g.mu.Unlock()

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
	g.mu.Lock()
	defer g.mu.Unlock()

	_, points := g.CalculateAndUpdatePoints()
	gameEndedMessage := GameMessage{Type: "game-ended", Payload: GameEndStats{
		WinningTeam: g.LatestWinningTeam,
		RoundPoints: points,
		PointsSoFar: g.Points,
	}}
	jsonMessage, err := json.Marshal(gameEndedMessage)
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
