package main

import "fmt"

// Channel unbuffered: make(chan T)
// Channel buffered:   make(chan T, kapasitas)

func main() {
	// Channel dengan buffer 3
	ch := make(chan string, 3)

	// Bisa kirim 3 tanpa blok (buffer belum penuh)
	ch <- "pesan 1" // dia kirim dulu ke capacity
	ch <- "pesan 2" //
	ch <- "pesan 3"
	//ch <- "pesan 4" // BLOK! Buffer penuh

	fmt.Printf("Panjang buffer: %d\n", len(ch))   // 3
	fmt.Printf("Kapasitas buffer: %d\n", cap(ch)) // 3

	// Terima tanpa goroutine (buffer tidak kosong)
	fmt.Println(<-ch) // pesan 1
	fmt.Println(<-ch) // pesan 2
	fmt.Println(<-ch) // pesan 3
	fmt.Println(<-ch) // BLOK! Buffer kosong
}
