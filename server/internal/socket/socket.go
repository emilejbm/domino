package socket

import (
	"log"
	"sync"

	socketio "github.com/googollee/go-socket.io"
)

func CreateSocketHandler(gameLock *sync.Mutex) (*socketio.Server, error) {
	socket := socketio.NewServer(nil)

	if socket == nil {
		log.Fatal("socket io failed to get created")
		return nil, nil
	}

	socket.OnConnect("/", func(s socketio.Conn) error {
		log.Println("New connection: ", s.ID())
		s.Emit("logMessage")
		return nil
	})

	socket.OnEvent("/", "joinGame", func(s socketio.Conn, gameCode, playerID string) {
		// gameLock.Lock()
		//defer gameLock.Unlock()

		// game, exists := games[gameCode]
		// if !exists || len(game.Players) < 4 {
		// 	s.Emit("error", "Cannot join: Game does not exist or is incomplete.")
		// 	return
		// }

		// s.Join(gameCode)
		// log.Printf("Player %s joined room %s\n", playerID, gameCode)
		// s.Emit("startGame", game)
	})

	// Handle player moves
	socket.OnEvent("/game", "playerMove", func(s socketio.Conn, gameCode, playerID, move string) {
		// gameLock.Lock()
		// defer gameLock.Unlock()

		// game, exists := games[gameCode]
		// if !exists || game.State != "active" {
		// 	s.Emit("error", "Game is not active")
		// 	return
		// }

		// if game.TurnOrder[game.CurrentTurn] != playerID {
		// 	s.Emit("error", "Not your turn")
		// 	return
		// }

		// // Process move (for simplicity, just log it)
		// log.Printf("Player %s made move: %s\n", playerID, move)

		// // Update turn
		// game.CurrentTurn = (game.CurrentTurn + 1) % len(game.TurnOrder)
		// nextPlayerID := game.TurnOrder[game.CurrentTurn]

		// // Broadcast updated game state
		// socket.BroadcastToRoom("/", gameCode, "moveUpdate", map[string]interface{}{
		// 	"playerID": playerID,
		// 	"move":     move,
		// 	"nextTurn": nextPlayerID,
		// })
	})

	socket.OnError("/", func(s socketio.Conn, e error) {
		log.Println("Socket.IO error:", e)
	})

	socket.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println("Disconnected:", reason)
	})

	return socket, nil
}
