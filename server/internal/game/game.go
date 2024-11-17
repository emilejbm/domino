package game

import (
	"github.com/emilejbm/domino/server/internal/player"
)

type Game struct {
	Code        string                    // Unique game code
	Players     map[string]*player.Player // Map of player IDs to players
	TurnOrder   []string                  // Order of players' turns
	CurrentTurn int                       // Index of the current player
	State       string                    // Game state: "waiting", "active", or "completed"
}
