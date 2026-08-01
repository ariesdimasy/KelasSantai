package main

import "fmt"

// Struct dasar
type Person struct {
	Nama  string
	Email string
	Umur  int
}

func (p Person) Sapa() string {
	return fmt.Sprintf("Halo, saya %s (%d thn)", p.Nama, p.Umur)
}

// Mahasiswa EMBED Person
type Mahasiswa struct {
	Person // ← embedded (bukan field bernama!)
	NIM    string
	Prodi  string
	IPK    float64
}

// Dosen juga embed Person
type Dosen struct {
	Person
	NIDN   string
	Matkul string
}

func main() {
	mhs := Mahasiswa{
		Person: Person{Nama: "Budi", Email: "budi@email.com", Umur: 21},
		NIM:    "2024001",
		Prodi:  "Informatika",
		IPK:    3.75,
	}

	// Field Person di-PROMOTE ke Mahasiswa!
	fmt.Println(mhs.Nama)  // "Budi" (bukan mhs.Person.Nama)
	fmt.Println(mhs.Email) // "budi@email.com"

	// Method Person juga di-PROMOTE!
	fmt.Println(mhs.Sapa()) // "Halo, saya Budi (21 thn)"

	// Field Mahasiswa sendiri
	fmt.Printf("%s — %s — IPK %.2f\n", mhs.NIM, mhs.Prodi, mhs.IPK)
}
