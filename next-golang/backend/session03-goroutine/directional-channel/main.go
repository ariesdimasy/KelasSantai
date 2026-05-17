package main

import "fmt"

// DIRECTIONAL CHANNEL
// Batasi arah untuk keamanan!

// chan<- = hanya bisa KIRIM
func kirimData(ch chan<- string, data string) {
	ch <- data // OK!
	// <-ch      // ERROR!
}

// <-chan = hanya bisa TERIMA
func terimaData(ch <-chan string) string {
	return <-ch // OK!
	// ch <- "x" // ERROR!
}

func main() {
	ch := make(chan string)
	go kirimData(ch, "halo goroutine!")
	pesan := terimaData(ch)
	fmt.Println(pesan)
	// halo goroutine!
}

// Pipeline dengan direktional channel:
func proses(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			out <- v * 2
		}
	}()
	return out
}
