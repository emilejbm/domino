package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/emilejbm/domino/server/internal/game"
	"github.com/emilejbm/domino/server/internal/player"
	"github.com/emilejbm/domino/server/internal/router"
	"github.com/emilejbm/domino/server/internal/socket"
)

var players []player.Player
var games = make(map[string]*game.Game)
var gameLock = sync.Mutex{}

func main() {

	router, err := router.CreateRouter(&gameLock)
	if err != nil {
		log.Fatal("error creating router: ", err)
	}

	router.PathPrefix("/build/").Handler(http.StripPrefix("/build/", http.FileServer(http.Dir("./build"))))

	socket, err := socket.CreateSocketHandler(&gameLock)
	if err != nil {
		log.Fatal("error getting socket handler: ", err)
	}

	go socket.Serve()
	defer socket.Close()

	// Integrate Socket.IO with mux
	router.Handle("/socket.io/", router)

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
