package main

import (
	"fmt"
	"time"
)

func test() {
	fmt.Println("test")
}

// Select: pilih channel yang siap!
func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	test()

	// anonymouse go routine
	go func() {
		time.Sleep(200 * time.Millisecond)
		ch1 <- "satu"
	}() // parentheses di ujung function untuk langsung menjalankan fungsi anonim tersebut

	go func() {
		time.Sleep(100 * time.Millisecond)
		ch2 <- "dua"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println("ch1:", msg1)
		case msg2 := <-ch2:
			fmt.Println("ch2:", msg2)
		}
	}
	// Output:
	// ch2: dua  (100ms lebih cepat)
	// ch1: satu  (200ms)
}
