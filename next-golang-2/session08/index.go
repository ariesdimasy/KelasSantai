package main

import (
	"fmt"
	"sync"
	"time"
)

func hello(count int) {
	for i := 0; i <= count; i++ {
	}
	fmt.Println("Hello ", count)
}

func goHello(count int, wg *sync.WaitGroup) {
	defer wg.Done() // ← SELALU defer! Dipanggil saat goroutine selesai
	wg.Add(count)
	for i := 0; i <= count; i++ {
	}
	fmt.Println("Go Hello ", count)
}

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // ← SELALU defer! Dipanggil saat goroutine selesai
	fmt.Printf("Worker %d mulai\n", id)
	time.Sleep(time.Duration(id*100) * time.Millisecond)
	fmt.Printf("Worker %d selesai\n", id)
}

// biaanya kalau goroutine tidak tampil di cmd , itu karena func main sudah kelar duluan
// DIBANDING goroutine
func main() {

	var wg sync.WaitGroup

	go goHello(1000, &wg)
	go goHello(2000, &wg)
	go goHello(3000, &wg)

	// synchronous
	hello(1000)
	hello(2000)
	hello(3000)

	go func() {
		fmt.Println("goroutine , anonimous function ")
		worker(100, &wg)
	}()

	// for i := 0; i < 5; i++ {
	// 	go func() { fmt.Printf("Worker %d\n", i) }()
	// 	worker(i, &wg)
	// }

	wg.Wait()
	fmt.Println("Semua progress selesai")
}
