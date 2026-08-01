package main

import (
	"fmt"
	"os"
)

// DEFER — jadwalkan eksekusi di AKHIR fungsi
// Berguna: close file, unlock mutex, logging
func bacaFile(nama string) error {
	file, err := os.Open(nama)
	if err != nil {
		return err
	}
	defer file.Close() // PASTI dipanggil, bahkan saat error!
	// ... proses file ...
	return nil
}

// Multiple defer = LIFO (Last In, First Out)
func lifo() {
	defer fmt.Println("1") // terakhir
	defer fmt.Println("2")
	defer fmt.Println("3") // pertama
} // Output: 3 → 2 → 1

// PANIC — hentikan eksekusi (hanya untuk programmer error!)
func mustPositive(n int) int {
	if n <= 0 {
		panic(fmt.Sprintf("harus positif, dapat: %d", n))
	}
	return n
}

// RECOVER — tangkap panic (harus dalam defer!)
func safeRun(fn func()) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic tertangkap: %v", r)
		}
	}()
	fn()
	return nil
}

func main() {
	// Penggunaan recover:
	err := safeRun(func() {
		mustPositive(-5) // akan panic!
	})
	if err != nil {
		fmt.Println("Aman:", err) // Aman: panic tertangkap: harus positif....
	}
}
