package main

import "fmt"

func main() {
	var num = 12

	if num >= 17 {
		fmt.Println("Anda boleh voting")
	} else {
		fmt.Println("Anda belum boleh voting")
	}

	var color = "red"

	if color == "red" {
		fmt.Println("Anda harus berhenti")
	} else if color == "yellow" {
		fmt.Println("Anda harus hati - hati")
	} else if color == "green" {
		fmt.Println("Anda boleh jalan")
	} else {
		fmt.Println("warna invalid")
	}

	// switch — lebih bersih dari if-else chain
	// TIDAK perlu break — otomatis stop!

	hari := "Senin"
	switch hari {
	case "Sabtu", "Minggu":
		fmt.Println("Weekend!")
	case "Senin":
		fmt.Println("Awal minggu")
	default:
		fmt.Println("Hari biasa")
	}

	// switch tanpa ekspresi = if-else chain
	angka := 85
	switch {
	case angka >= 90:
		fmt.Println("A")
	case angka >= 80:
		fmt.Println("B")
	case angka >= 70:
		fmt.Println("C")
	default:
		fmt.Println("D")
	}

	fmt.Println("Program selesai")
}
