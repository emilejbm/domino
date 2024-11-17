package router

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
)

func CreateRouter(gameLock *sync.Mutex) (*mux.Router, error) {
	router := mux.NewRouter()
	createRoutes(router)
	return router, nil
}

func createRoutes(router *mux.Router) {
	router.HandleFunc("/", handleLandingPage).Methods("GET")
	router.HandleFunc("/", handleCreateGame).Methods("POST")
	router.HandleFunc("/mesa/#", handleJoinGame).Methods("GET")
}

func handleLandingPage(w http.ResponseWriter, r *http.Request) {
	// return jsx
	w.Header().Set("Content-Type", "application/javascript")
	http.ServeFile(w, r, "./build/index.html")

	w.Write([]byte(fmt.Sprintf("Game created with code")))
}

func handleCreateGame(w http.ResponseWriter, r *http.Request) {

	// create random game code
	// put into list of running games
	// redirect to game created

	gameCode := generateGameCode()
	w.Write([]byte(fmt.Sprintf("Game created with code: %s", gameCode)))
}

func generateGameCode() string {
	// generate unique game code (compare to in list of games)
	return "#ABCD"
}

func handleJoinGame(w http.ResponseWriter, r *http.Request) {
	// check payload for game code
	// check whether player can join (amount of players + host decision (always first player?))
	// update game status
}
