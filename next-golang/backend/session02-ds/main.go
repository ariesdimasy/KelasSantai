package main

import (
	"fmt"
	"os"
	"session02ds/methods"
	"session02ds/models"
)

func main() {

	var mahasiswa1 = models.Mahasiswa{
		Person:   models.Person{ID: 1, Nama: "John Doe", Age: 20},
		Email:    "john.doe@gmail.com",
		Password: "password123",
		Jurusan:  "Teknik Informatika",
		Aktif:    true,
	}

	var m2 models.Mahasiswa

	m2.Person.ID = 2
	m2.Person.Nama = "Jane Doe"
	m2.Person.Age = 22
	m2.Email = "jane.doe@gmail.com"
	m2.Password = "password456"
	m2.Jurusan = "Sistem Informasi"
	m2.Aktif = false
	// m2.status = "Tidak Aktif"

	fmt.Println(mahasiswa1)

	models.CalculateNumber()

	models.CalculateNumber()

	var p1 = &models.Product{
		ID:    1,
		Title: "Laptop",
		Price: 1_000_000,
		Stock: 10,
	}

	fmt.Println(p1)

	diskon(p1, 10)

	fmt.Println(p1)

	p1.ID = 2

	fmt.Println(p1)

	var l1 = models.Lingkaran{
		Jari: 7,
	}

	fmt.Println(l1.Luas())
	fmt.Println(l1.Keliling())

	l1.Perbesar(2)

	fmt.Println(l1.Luas())
	fmt.Println(l1.Keliling())

	mahasiswa1.Info()
	mahasiswa1.ChangeEmail("john.doe.updated@gmail.com")
	mahasiswa1.Info()

	var dosen1 = models.Dosen{
		Person:      models.Person{ID: 1, Nama: "Dr. Smith", Age: 45},
		Email:       "dr.smith@gmail.com",
		Password:    "password789",
		Jurusan:     "Teknik Informatika",
		Aktif:       true,
		Sertifikasi: "S1",
	}

	fmt.Println(dosen1)

	// Kumpulkan tipe BERBEDA dalam satu slice!
	shapes := []methods.Shape{
		&models.Lingkaran{Jari: 7},
		&models.PersegiPanjang{Panjang: 5, Lebar: 5},
		&models.Lingkaran{Jari: 3}, // pointer juga bisa!
	}

	fmt.Println("=== BANGUN DATAR ===")
	for _, s := range shapes {
		methods.CetakInfo(s) // panggil yang sama!
	}
	fmt.Printf("Total luas: %.2f\n",
		methods.TotalLuas(shapes))

	// Type Assertion — ekstrak tipe dari interface
	var s methods.Shape = &models.Lingkaran{Jari: 5}

	// Cara AMAN dengan ok check
	if l, ok := s.(*models.Lingkaran); ok {
		fmt.Println("Ini Lingkaran, jari:", l.Jari)
	} else {
		fmt.Println("Bukan Lingkaran")
	}

	// check tipe data
	cetakApapun(42)                        // Nilai: 42, Tipe: int
	cetakApapun("halo")                    // Nilai: halo, Tipe: string
	cetakApapun(true)                      // Nilai: true, Tipe: bool
	cetakApapun(models.Lingkaran{Jari: 5}) // Nilai: {5}, Tipe: main.Lingkaran

	// Penggunaan recover:
	err := safeRun(func() {
		mustPositive(-5) // akan panic!
	})
	if err != nil {
		fmt.Println("Aman:", err) // Aman: panic tertangkap: harus positif....
	}

}

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

// Type Switch — cek banyak tipe sekaligus
func identifikasi(s methods.Shape) string {
	switch v := s.(type) {
	case *models.Lingkaran:
		return fmt.Sprintf("Lingkaran r=%.1f, luas=%.2f", v.Jari, v.Luas())
	case *models.PersegiPanjang:
		return fmt.Sprintf("Persegi p=%.1f, l=%.1f, luas=%.2f", v.Panjang, v.Lebar, v.Luas())

	default:
		return fmt.Sprintf("Tipe tidak dikenal: %T", v)
	}
}

// Empty interface — bisa tampung tipe apapun!
func cetakApapun(v interface{}) {
	fmt.Printf("Nilai: %v, Tipe: %T\n", v, v)
}

func diskon(p *models.Product, persen float32) {
	p.Price = int(float32(p.Price) * (1 - persen/100))
}
