package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // ← SELALU defer! Dipanggil saat goroutine selesai
	fmt.Printf("Worker %d mulai\n", id)
	time.Sleep(time.Duration(id*100) * time.Millisecond)
	fmt.Printf("Worker %d selesai\n", id)
}

func main() {

	chStr := make(chan string)

	go func() {
		fmt.Println(" string dimasukkan kedalam channel ")
		chStr <- "Hello from goroutine!" // KIRIM
		fmt.Println(" Pengiriman selesai")
	}()

	received := <-chStr // TERIMA
	fmt.Println(" Menerima string dari channel: ", received)

	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go worker(i, &wg) // ← Pass pointer ke WaitGroup
	}
	wg.Wait() // ← Tunggu semua goroutine selesai
	fmt.Println("Worker selesai")

	// asynchronous / concurrent / tidak tunggu-tungguan
	go sayHello("Dimas goroutine")
	go sayHello("Rian goroutine")
	go sayHello("Rizky Goroutine")

	go func() {
		fmt.Println("Anonymous function ")
	}()

	// squential / synchronous / tunggu-tungguan
	sayHello("Dimas")
	sayHello("Rian")
	sayHello("Rizky")

	time.Sleep(500 * time.Millisecond)

	// Closure goroutine (perhatikan shadowing!)
	for i := 1; i <= 5; i++ {
		i := i // shadow variable — PENTING!
		go func() { fmt.Printf("Worker %d\n", i) }()
	}

	fmt.Println("Main Selesai")

}

func sayHello(name string) {
	fmt.Println(" Hello ", name)
}

// node js : asynchronous , callback, prise, async await
// golang : concurrent
