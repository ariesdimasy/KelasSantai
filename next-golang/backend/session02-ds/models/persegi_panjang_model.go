package models

type Shape interface {
	Luas() float64
	Keliling() float64
	Perbesar(f float64)
}

type PersegiPanjang struct {
	Panjang float64
	Lebar   float64
}

func (p PersegiPanjang) Luas() float64 {
	return p.Panjang * p.Lebar
}

func (p PersegiPanjang) Keliling() float64 {
	return 2 * (p.Panjang + p.Lebar)
}

func (p *PersegiPanjang) Perbesar(f float64) {
	p.Panjang *= f
	p.Lebar *= f
}
