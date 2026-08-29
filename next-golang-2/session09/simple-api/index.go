package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Create a new request multiplexer (router)
	mux := http.NewServeMux() // app starter / instance

	// method sama path url  ( Route )
	// Register a route matching a specific HTTP method (Go 1.22+)
	mux.HandleFunc("GET /welcome", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Welcome to Go's HTTP server!")
	})

	// Register a route matching a specific HTTP method (Go 1.22+)
	mux.HandleFunc("POST /welcome", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Request has been added to server!")
	})

	// Register a route matching a specific HTTP method (Go 1.22+)
	mux.HandleFunc("GET /service", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "This is Service Page from server!")
	})

	// Register a fallback or root route
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprint(w, "Page not found / page tidak ada")
	})

	// Configure and start the server
	log.Println("Server listening on port 8080...")
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
