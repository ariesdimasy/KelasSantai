// Error dasar
package main

import (
	"errors"
	"fmt"
	"math"
)

func bagi(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New(
			"tidak bisa bagi dengan nol")
	}
	return a / b, nil
}

func hitungAkar(x float64) (float64, error) {
	if x < 0 {
		return 0, fmt.Errorf(
			"akar dari negatif: %.2f", x)
	}
	return math.Sqrt(x), nil
}

func main() {

	hasil, err := bagi(10, 0)
	// handle error tidak menggunakan tray catch
	if err != nil { // kalau error terjadi
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Hasil:", hasil)

	akar, err := hitungAkar(-9)
	if err != nil {
		fmt.Println("Error:", err)
	}
	_ = akar
}
