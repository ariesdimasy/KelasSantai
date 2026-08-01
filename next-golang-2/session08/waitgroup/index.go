package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, wg *sync.WaitGroup) {
	defer wg.Done() // ← SELALU defer! Dipanggil saat goroutine selesai
	fmt.Printf("Worker %d mulai\n", id)
	time.Sleep(time.Duration(id*1000) * time.Millisecond)
	fmt.Printf("Worker %d selesai\n", id)
}

func main() {
	var wg sync.WaitGroup

	for i := 1; i <= 5; i++ {
		wg.Add(1)         // ← Add SEBELUM goroutine dimulai!
		go worker(i, &wg) // ← Kirim POINTER ke wg!
	}

	wg.Wait() // ← BLOK di sini sampai semua Done() dipanggil
	fmt.Println("✅ Semua 5 worker selesai!")
}

// Output (urutan berbeda setiap run, tapi baris terakhir SELALU di akhir):
// Worker 3 mulai     Worker 1 mulai    Worker 5 mulai
// Worker 2 mulai     Worker 4 mulai    Worker 1 selesai
// ... (urutan random)
// ✅ Semua 5 worker selesai!
