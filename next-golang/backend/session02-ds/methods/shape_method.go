package methods

import "fmt"

type Shape interface {
	Luas() float64
	Keliling() float64
	Perbesar(f float64)
}

// Polimorfisme!
// Fungsi terima interface — tidak peduli
// siapa implementasinya!
func CetakInfo(s Shape) {
	fmt.Printf(" Luas: %7.2f | Kel: %7.2f\n",
		s.Luas(), s.Keliling())
}

func TotalLuas(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Luas()
	}
	return total
}
