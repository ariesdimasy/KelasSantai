package main

import "fmt"

func generator(n int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch) // WAJIB tutup saat selesai!
		for i := 1; i <= n-1; i++ {
			ch <- i // kirim angka 1 sampai n
		}
		// Goroutine selesai, channel ditutup
	}()
	return ch // range generator
}

func main() {
	// for range berhenti otomatis saat channel closed
	for angka := range generator(5) {
		fmt.Printf("Menerima: %d\n", angka)
	}
	fmt.Println("Selesai menerima semua data")
}

// Output:
// Menerima: 1
// Menerima: 2
// Menerima: 3
// Menerima: 4
// Menerima: 5
// Selesai menerima semua data

// // Cek apakah channel closed dengan ok:
// nilai, ok := <-ch
// if !ok {
//     fmt.Println("Channel sudah ditutup")
// }
