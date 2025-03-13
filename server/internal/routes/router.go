package routes

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"sync"

	game "github.com/emilejbm/domino/server/internal/game"
	socket "github.com/emilejbm/domino/server/internal/socket"
	"github.com/gorilla/mux"
)

type GetPlayersInLobbyRequest struct {
	GameCode string `json:"gameCode"`
}

type JoinGameRequest struct {
	GameCode  string `json:"gameCode"`
	NewPlayer string `json:"player"`
}

// should also include image of other players
type GetPlayersResponse struct {
	Players []string `json:"players"`
}

func CreateRouter(gameLock *sync.Mutex) (*mux.Router, error) {
	router := mux.NewRouter()
	createRoutes(router)

	return router, nil
}

func createRoutes(router *mux.Router) {
	// router.HandleFunc("/", handleLandingPage).Methods("GET")
	router.HandleFunc("/create-lobby", handleCreateLobby).Methods("GET")
	router.HandleFunc("/lobby/", handleGetLobby).Methods("GET")
	router.HandleFunc("/ws", socket.HandleWebSocket)
}

func handleLandingPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/javascript")
	http.ServeFile(w, r, "./build/index.html")
}

// respond with game code
func handleCreateLobby(w http.ResponseWriter, r *http.Request) {
	log.Println("creating lobby")
	lobby, err := game.GetOrCreateLobby()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	gameCodeJson := map[string]string{"gameCode": lobby.GameCode}
	response, err := json.Marshal(gameCodeJson)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func handleGetLobby(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	gameCode := parts[2]
	log.Println("gameCode:", gameCode)
	lobby := game.GetLobby(gameCode)

	w.Header().Set("Content-Type", "application/json")

	if lobby == nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte{})
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte{})
}

func handleStartGame(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	var data GetPlayersInLobbyRequest
	err = json.Unmarshal(body, &data)
	if err != nil {
		http.Error(w, "Unable to parse JSON", http.StatusBadRequest)
		return
	}
	// gameState, _ := game.GetGame(data.GameCode)
	// gameState.InitGame()
	// go gameState.GameLoop() // Start the game loop in a goroutine
}
