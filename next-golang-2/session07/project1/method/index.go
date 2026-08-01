package main

import "fmt"

// VALUE RECEIVER — tidak ubah data
type Lingkaran struct{ Jari float64 }

func (l Lingkaran) Luas() float64 {
	return 3.14 * l.Jari * l.Jari
}

// receiver
func (l Lingkaran) Keliling() float64 {
	return 2 * 3.14 * l.Jari
}

// receiver
func (l Lingkaran) String() string {
	return fmt.Sprintf(
		"Lingkaran(r=%.1f)", l.Jari)
}

// POINTER RECEIVER — mengubah data!
func (l *Lingkaran) Perbesar(f float64) {
	l.Jari *= f // ubah data asli!
	// l.Jari = l.Jari * f
}

// Method pada Mahasiswa
type Mahasiswa struct {
	ID    string
	Nama  string
	Email string
	IPK   float64
}

// Value receiver — read
func (m Mahasiswa) Info() string {
	return fmt.Sprintf(
		"[%d] %s | IPK: %.2f",
		m.ID, m.Nama, m.IPK)
}

func (m Mahasiswa) Predikat() string {
	switch {
	case m.IPK >= 3.5:
		return "Cumlaude 🎓"
	case m.IPK >= 3.0:
		return "Sangat Memuaskan"
	case m.IPK >= 2.5:
		return "Memuaskan"
	default:
		return "Kurang Memuaskan"
	}
}

// Pointer receiver — mutasi!
func (m *Mahasiswa) SetIPK(ipk float64) error {
	if ipk < 0 || ipk > 4 {
		return fmt.Errorf(
			"IPK tidak valid: %.2f", ipk)
	}
	m.IPK = ipk
	return nil
}

func main() {
	c := Lingkaran{Jari: 7}
	fmt.Printf("Luas: %.2f\n", c.Luas())
	fmt.Printf("Kel:  %.2f\n", c.Keliling())
	fmt.Println(c) // Lingkaran(r=7.0)

	c.Perbesar(2)
	fmt.Printf("Jari baru: %.1f\n", c.Jari) // 14.0

	mahasiswa := Mahasiswa{
		ID:    "1200965456",
		Nama:  "Aries Dimas",
		Email: "ariesdimas@gmail.com",
		IPK:   3.90,
	}

	fmt.Println(mahasiswa.Info())
	fmt.Println(mahasiswa.Predikat())

	mahasiswa.SetIPK(2.89)

	fmt.Println(mahasiswa.Predikat())
}
