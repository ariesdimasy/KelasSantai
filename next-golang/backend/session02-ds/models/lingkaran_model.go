package models

type Lingkaran struct {
	Jari float64
}

func (l Lingkaran) Luas() float64 {
	return 3.14 * l.Jari * l.Jari
}

func (l Lingkaran) Keliling() float64 {
	return 2 * 3.14 * l.Jari
}

func (l *Lingkaran) Perbesar(f float64) {
	l.Jari *= f
}
