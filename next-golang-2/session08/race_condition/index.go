package main

import (
	"fmt"
	"sync"
)

// BERBAHAYA: Race condition!
var counter int
var mu sync.Mutex

func tambah(wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 0; i < 1000; i++ {
		mu.Lock()   // Kunci — goroutine lain harus tunggu
		counter++   // RACE CONDITION! Baca-Tulis tidak atomic
		mu.Unlock() // Buka kunci — goroutine lain bisa masuk

	}
}

// Alternatif: sync.RWMutex — untuk read-heavy workload
// var rwmu sync.RWMutex

// func baca() int {
// 	rwmu.RLock() // Banyak goroutine bisa baca bersamaan
// 	defer rwmu.RUnlock()
// 	return counter
// }

// func tulis(val int) {
// 	rwmu.Lock() // Hanya 1 goroutine yang bisa tulis
// 	defer rwmu.Unlock()
// 	counter = val
// }

func main() {
	var wg sync.WaitGroup
	wg.Add(2)
	go tambah(&wg)
	go tambah(&wg)
	wg.Wait()
	fmt.Println(counter) // Harusnya 2000, tapi hasil tak tentu!
	// Bisa 1784, 1923, 2000 — tidak konsisten!
}
