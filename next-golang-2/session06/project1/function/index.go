package main

import "fmt"

// Fungsi dengan satu return value
func tambah(a, b int) int { return a + b }

// Fungsi dengan MULTIPLE return values — FITUR UNIK GO!
func bagi(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("tidak bisa bagi dengan nol")
	}
	return a / b, nil // nil = tidak ada erroR
}

// Named return values
func persegi(sisi float64) (luas, keliling float64) {
	luas = sisi * sisi
	keliling = 4 * sisi
	return // return tanpa argument — return named values
}

func main() {
	// salam()
	// sapaNama("Budi")
	fmt.Println(tambah(5, 3)) // 8

	hasil, err := bagi(10, 3)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("%.2f\n", hasil) // 3.33
	}

	l, k := persegi(5)                               // calling funtion
	fmt.Printf("Luas: %.0f, Keliling: %.0f\n", l, k) // 25, 20
}
