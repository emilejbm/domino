package game

import (
	"errors"
	"log"
	"math/rand"
	"strings"
	"time"
)

// ------- debugging stuff ------- //

func PrintAllLobbyInfo() {
	if len(Lobbies) > 0 {
		for gameCode, lobby := range Lobbies {
			log.Println("printing lobby info", gameCode)
			for _, p := range lobby.Players {
				log.Println("players", p.Name)
			}
		}
	} else {
		log.Println("no lobbies")
	}
}

// ------- game state stuff ------- //

func GetPlayersGame(clientID string) *Game {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()
	for _, g := range ActiveGames {
		for _, p := range g.Players {
			if p.ID == clientID {
				return g
			}
		}
	}
	return nil
}

func GetGame(gameCode string) *Game {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()
	game, ok := ActiveGames[gameCode]
	if !ok {
		return nil
	}
	return game
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
}

func (g *Game) someoneCanPlay() bool {
	leftEnd := g.GameBoard.LeftEnd.Domino
	rightEnd := g.GameBoard.RightEnd.Domino
	for _, player := range g.Players {
		for _, domino := range player.Hand {
			if domino.LeftSide == rightEnd.RightSide || domino.RightSide == rightEnd.RightSide || domino.LeftSide == leftEnd.LeftSide || domino.RightSide == leftEnd.LeftSide {
				return true
			}
		}
	}

	return false
}

func (g *Game) CalculateAndUpdatePoints() (team int, points int) {
	var teamAPoints int
	var teamBPoints int
	var winningTeam = -1
	for i, p := range g.Players {
		if len(p.Hand) == 0 {
			winningTeam = i % 2
			g.LatestWinner = p
		}
		for _, domino := range p.Hand {
			if i%2 == 0 {
				teamAPoints += domino.LeftSide
				teamAPoints += domino.RightSide
			} else {
				teamBPoints += domino.LeftSide
				teamBPoints += domino.RightSide
			}
		}
	}

	if winningTeam == -1 {
		// hubo tranque
		if teamAPoints < teamBPoints {
			winningTeam = 0
			g.LatestWinner = g.Players[0]
		} else {
			winningTeam = 1
			g.LatestWinner = g.Players[1]
		}
	}
	g.Points[winningTeam] += teamAPoints + teamBPoints
	g.LatestWinningTeam = winningTeam
	return winningTeam, teamAPoints + teamBPoints
}

// add to tail
func (b *GameBoard) AddDominoToRightEnd(newNode *DominoNode) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.LeftEnd == nil {
		b.LeftEnd = newNode
		b.RightEnd = newNode
	} else {
		b.RightEnd.Next = newNode
		newNode.Prev = b.RightEnd
		b.RightEnd = newNode
	}
}

// add to head
func (b *GameBoard) AddDominoToLeftEnd(newNode *DominoNode) {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.LeftEnd == nil {
		b.LeftEnd = newNode
		b.RightEnd = newNode
	} else {
		newNode.Next = b.LeftEnd
		b.LeftEnd.Prev = newNode
		b.LeftEnd = newNode
	}
}

func (b *GameBoard) toDominoArray() []*Domino {
	var dominoes []*Domino

	current := b.LeftEnd
	for current != nil {
		dominoes = append(dominoes, current.Domino)
		current = current.Next
	}
	return dominoes
}

func (d *DominoNode) swapDominoSides() {
	temp := d.Domino.LeftSide
	d.Domino.LeftSide = d.Domino.RightSide
	d.Domino.RightSide = temp
}

func (b *GameBoard) ClearGameBoard() {
	b.mu.Lock()
	b.LeftEnd = nil
	b.RightEnd = nil
	b.mu.Unlock()
}

// ------- init stuff ------- //

func CreateGameFromLobby(lobby *Lobby) (*Game, error) {
	ActiveGamesMu.Lock()
	defer ActiveGamesMu.Unlock()
	if lobby == nil {
		return nil, errors.New("lobby is nil")
	}
	newGame := &Game{
		GameCode:   lobby.GameCode,
		GameBoard:  &GameBoard{},
		Players:    lobby.Players,
		Points:     [2]int{0, 0},
		Paused:     false,
		MovesSoFar: []*Domino{},
	}
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
	newGame := &Game{
		GameCode:   newGameCode,
		GameBoard:  &GameBoard{},
		Points:     [2]int{0, 0},
		Paused:     false,
		MovesSoFar: []*Domino{},
	}
	ActiveGames[newGame.GameCode] = newGame

	return newGame, nil
}

func (g *Game) FindStartingTurn() {
	g.mu.Lock()
	defer g.mu.Unlock()

	doubleSix := &Domino{LeftSide: 6, RightSide: 6}
	for i, p := range g.Players {
		if containsDomino(p.Hand, *doubleSix) && g.LatestWinner == nil {
			g.CurrentTurn = i
			return
		} else if p == g.LatestWinner {
			g.CurrentTurn = i
			return
		}
	}
}

func containsDomino(hand []Domino, domino Domino) bool {
	for _, d := range hand {
		if d == domino || (d.LeftSide == domino.RightSide && d.RightSide == domino.LeftSide) { // check for both orientations
			return true
		}
	}
	return false
}

func CreateDominoes() []Domino {
	dominoes := []Domino{}
	for i := 0; i <= 6; i++ {
		for j := i; j <= 6; j++ {
			dominoes = append(dominoes, Domino{LeftSide: i, RightSide: j})
		}
	}
	return dominoes
}

func shuffleDominoes() []Domino {
	dominoes := CreateDominoes()
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(dominoes), func(i, j int) {
		dominoes[i], dominoes[j] = dominoes[j], dominoes[i]
	})
	return dominoes
}

func generateGameCode() (string, error) {
	// generates unique, random game code (4 alphanumeric characters)
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const gameCodeLength = 4
	var generatedCode string

	rand.Seed(time.Now().UnixNano())

	existingSet := make(map[string]struct{}, len(ActiveGames))
	for _, game := range ActiveGames {
		existingSet[game.GameCode] = struct{}{}
	}

	// could add for loop to retry for certain amount of attempts
	builder := strings.Builder{}
	builder.Grow(gameCodeLength)
	for i := 0; i < gameCodeLength; i++ {
		builder.WriteByte(charset[rand.Intn(len(charset))])
	}
	generatedCode = builder.String()
	if _, exists := existingSet[generatedCode]; !exists {
		return generatedCode, nil
	}

	return "", errors.New("maximum active games reached")
}

// ------- bot stuff ------- //
func (g *Game) BotMakeMove(bot *Player) {
	time.Sleep(2 * time.Second)
	var validDomino *Domino = nil
	for _, domino := range bot.Hand {
		tempDomino := &Domino{LeftSide: domino.LeftSide, RightSide: domino.RightSide}
		if g.IsValidMove(tempDomino, bot) {
			validDomino = tempDomino
			break
		}
	}

	if validDomino != nil {
		gameBoardLengthBeforeMove := len(g.GameBoard.toDominoArray())
		g.MakeMove(bot, validDomino, "Left")
		if len(g.GameBoard.toDominoArray()) == gameBoardLengthBeforeMove {
			g.MakeMove(bot, validDomino, "Right")
		}
		g.BroadcastUpdatedGameBoard()
	} else {
		log.Println("bot passed")
		g.MovesSoFar = append(g.MovesSoFar, nil)
		g.CurrentTurn = (g.CurrentTurn + 1) % len(g.Players)
		g.BroadCastSomeonePassed(bot)
	}
}

func (g *Game) fillWithBots() {
	g.mu.Lock()
	defer g.mu.Unlock()
	requiredNumberOfPlayers := 4

	for i := len(g.Players); i < requiredNumberOfPlayers; i++ {
		newPlayer := &Player{Name: generateBotName(), IsBot: true}
		g.Players = append(g.Players, newPlayer)
	}
}

func generateBotName() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const botNameLength = 4

	rand.Seed(time.Now().UnixNano())
	var sb strings.Builder
	for i := 0; i < botNameLength; i++ {
		sb.WriteByte(charset[rand.Intn(len(charset))])
	}
	return "Bot-" + sb.String()
}
