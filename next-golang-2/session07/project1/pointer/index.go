package main

import "fmt"

// Buat pointer ke struct
type Produk struct {
	ID    int
	Nama  string
	Harga float32
	Stok  int
}

// Fungsi dengan pointer receiver
// → mengubah data ASLI!
func diskon(p *Produk, persen float64) {
	fmt.Println("diskon func : ", int64(p.Harga))
	p.Harga = p.Harga * float32(1-persen/100)
}

func diskonValue(p Produk, persen float64) {
	fmt.Println("diskon func : ", int64(p.Harga))
	p.Harga = p.Harga * float32(1-persen/100)
}

func main() {

	p := &Produk{
		ID:    1,
		Nama:  "Laptop",
		Harga: 15_000_000,
		Stok:  10,
	}

	// Go auto-dereference:
	// Tidak perlu (*p).Nama — cukup p.Nama!
	p.Harga = 14_500_000
	p.Stok-- // stok berkurang 1

	laptop := Produk{Nama: "Laptop", Harga: 15_000_000}
	diskon(&laptop, 10) // kirim alamat
	//diskonValue(laptop, 10) // kirim alamat
	fmt.Printf("Harga: %.0f\n", laptop.Harga)
	// Output: Harga: 13500000
}
