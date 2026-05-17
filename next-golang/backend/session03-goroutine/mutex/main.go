package main

import (
	"fmt"
	"sync"
)

// ❌ RACE CONDITION!
var counter int
var mu sync.Mutex // untuk mengunci akses ke counter

func tambah(wg *sync.WaitGroup) {
	defer wg.Done()
	for i := 0; i < 1000; i++ {
		mu.Lock()
		counter++ // BERBAHAYA!
		// Baca-Tulis tidak atomic
		mu.Unlock()
		// Jika tidak menggunakan mutex, dua goroutine bisa membaca nilai counter yang sama
		// lalu menambahkannya, sehingga hasilnya bisa kurang dari 2000!
	}
}

func main() {
	var wg sync.WaitGroup
	wg.Add(2)
	go tambah(&wg) // goroutine 1
	go tambah(&wg) // goroutine 2
	wg.Wait()
	fmt.Println(counter)
	// Harusnya 2000!
	// Tapi bisa: 1784, 1923...
	// Hasil TIDAK TENTU = race condition!
}
