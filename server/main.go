package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/emilejbm/domino/server/internal/routes"
)

var gameLock = sync.Mutex{}

func main() {
	router, err := routes.CreateRouter(&gameLock)
	handler := routes.CorsMiddleware(router)
	if err != nil {
		log.Fatal("error creating router: ", err)
	}

	router.PathPrefix("/build/").Handler(http.StripPrefix("/build/", http.FileServer(http.Dir("./build"))))
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
