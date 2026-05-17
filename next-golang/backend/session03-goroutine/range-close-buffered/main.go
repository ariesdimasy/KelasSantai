package main

import "fmt"

// Range + Close

// generate channel yang nilainya integer
func generator(n int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch) // WAJIB!
		for i := 1; i <= n; i++ {
			ch <- i
		}
	}()
	return ch
}

func main() {
	// for range berhenti otomatis
	// saat channel di-close!
	for angka := range generator(5) {
		fmt.Println(angka)
	}
	// Output:
	// 1  2  3  4  5

	// Cek closed:

	val, ok := <-generator(5)
	if !ok {
		fmt.Println("Channel closed")
	} else {
		fmt.Println(" val => ", val)
	}

}
