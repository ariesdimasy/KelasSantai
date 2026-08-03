package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(0 * time.Millisecond)
		ch1 <- "satu"
	}()

	go func() {
		time.Sleep(5000 * time.Millisecond)
		ch2 <- "dua"
	}()

	// Select menunggu channel mana yang siap dulu
	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println("Dari ch1:", msg1)
		case msg2 := <-ch2:
			fmt.Println("Dari ch2:", msg2)
		default:
			fmt.Println("default selected")
		}

	}
}

// Output: "Dari ch2: dua" lalu "Dari ch1: satu"
// (ch2 lebih cepat 100ms vs 200ms)
