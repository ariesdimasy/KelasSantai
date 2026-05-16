package models

import "fmt"

type Mahasiswa struct {
	Person
	Email    string
	Password string
	Jurusan  string
	Aktif    bool
	status   string
}

type student struct {
	ID    int
	nama  string
	Email string
}

func (m Mahasiswa) Info() {
	fmt.Println("Nama : ", m.Nama, ", Email : ", m.Email,
		", Jurusan : ", m.Jurusan, "Aktif : ", m.Aktif)
}

func (m *Mahasiswa) ChangeEmail(email string) {
	m.Email = email
}

func CalculateNumber() {
	fmt.Println("Calculate Number")
}

func calculateNumberMini() {
	fmt.Println("Calculate Number Mini")
}
