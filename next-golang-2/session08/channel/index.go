package main

import "fmt"

// Buat channel
// ch := make(chan int)        // untuk int
// chStr := make(chan string)  // untuk string

// CHANNEL UNBUFFERED
// Pengirim BLOK sampai ada penerima
// Penerima BLOK sampai ada pengirim
// → Synchronous!

func main() {
	ch := make(chan int)

	go func() {
		fmt.Println("Goroutine: kirim 42")
		ch <- 42 // KIRIM
		// blok sampai main terima
		fmt.Println("Goroutine: selesai")
	}()

	fmt.Println("Main: tunggu data...")
	nilai := <-ch // TERIMA
	// blok sampai goroutine kirim
	fmt.Printf("Main: dapat %d\n", nilai)
}
