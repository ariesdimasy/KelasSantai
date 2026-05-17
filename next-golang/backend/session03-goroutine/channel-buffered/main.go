package main

import "fmt"

func main() {
	// make(chan T, kapasitas)
	ch := make(chan string, 3) // buffer 3 slot

	// Bisa kirim 3 TANPA goroutine!
	ch <- "pesan 1" // buffer: [1]
	ch <- "pesan 2" // buffer: [1,2]
	// ch <- "pesan 3" // buffer: [1,2,3]
	// ch <- "pesan 4" // BLOK! Buffer penuh

	fmt.Println(len(ch)) // 3 (isi)
	fmt.Println(cap(ch)) // 3 (kapasitas)

	fmt.Println(<-ch) // "pesan 1"
	fmt.Println(<-ch) // "pesan 2"
	fmt.Println(<-ch) // "pesan 3"
	// fmt.Println(<-ch) // BLOK! Kosong

}
