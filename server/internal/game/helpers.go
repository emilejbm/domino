package game

import (
	"errors"
	"log"
	"math/rand"
	"strings"
	"time"
)

// ------- helper functions ------- //

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

func playerInActiveGame(player *Player) bool {
	for _, g := range ActiveGames {
		for _, p := range g.Players {
			if p == player {
				return true
			}
		}
	}
	return false
}

func containsDomino(hand []Domino, domino Domino) bool {
	for _, d := range hand {
		if d == domino || (d.Left == domino.Right && d.Right == domino.Left) { //check for both orientations
			return true
		}
	}
	return false
}

func (g *Game) GetPlayerWithDoubleSix() *Player {
	for _, p := range g.Players {
		doubleSix := &Domino{Left: 6, Right: 6}
		if containsDomino(p.Hand, *doubleSix) {
			return p
		}
	}
	log.Println("no one has double six?")
	return nil
}

func CreateDominoes() []Domino {
	dominoes := []Domino{}
	for i := 0; i <= 6; i++ {
		for j := i; j <= 6; j++ {
			dominoes = append(dominoes, Domino{Left: i, Right: j})
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

func DealDominoes(dominoes []Domino, players []*Player) {
	numPlayers := len(players)
	dominoesPerPlayer := 7

	for i := 0; i < dominoesPerPlayer; i++ {
		for j := 0; j < numPlayers; j++ {
			players[j].Hand = append(players[j].Hand, dominoes[i*numPlayers+j])
		}
	}
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

func generateBotName() string {
	const botNameCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const botNameLength = 6 // Adjust as needed

	rand.Seed(time.Now().UnixNano())
	var sb strings.Builder
	for i := 0; i < botNameLength; i++ {
		sb.WriteByte(botNameCharset[rand.Intn(len(botNameCharset))])
	}
	return "Bot-" + sb.String()
}
