package main

import "fmt"

// Interface = kontrak method
type Shape interface {
	Luas() float64
	Keliling() float64
	String() string
}

// Lingkaran implementasi Shape
type Lingkaran struct{ Jari float64 }

func (l Lingkaran) Luas() float64 {
	return 3.14 * l.Jari * l.Jari
}
func (l Lingkaran) Keliling() float64 {
	return 2 * 3.14 * l.Jari
}

func (l Lingkaran) String() string {
	return fmt.Sprintf("⭕ r=%.1f", l.Jari)
}

// Persegi implementasi Shape
type Persegi struct{ Sisi float64 }

func (p Persegi) Luas() float64     { return p.Sisi * p.Sisi }
func (p Persegi) Keliling() float64 { return 4 * p.Sisi }
func (p Persegi) String() string {
	return fmt.Sprintf("■ s=%.1f", p.Sisi)
}

// Polimorfisme!
// Fungsi terima interface — tidak peduli
// siapa implementasinya!
func cetakInfo(s Shape) {
	fmt.Printf("%-12s Luas: %7.2f | Kel: %7.2f\n",
		s.String(), s.Luas(), s.Keliling())
}

func totalLuas(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Luas()
	}
	return total
}

func main() {
	// Kumpulkan tipe BERBEDA dalam satu slice!
	// slice atau array
	shapes := []Shape{
		Lingkaran{Jari: 7}, // struct
		Persegi{Sisi: 5},   // struct
		Lingkaran{Jari: 3},
	}

	fmt.Println("=== BANGUN DATAR ===")
	for _, s := range shapes {
		cetakInfo(s) // panggil yang sama!
	}
	fmt.Printf("Total luas: %.2f\n",
		totalLuas(shapes))
}
