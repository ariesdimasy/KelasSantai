package main

import (
	"errors"
	"fmt"
)

type Mahasiswa struct {
	Nama string
	IPK  float64
}

type ValidationError struct {
	Field   string
	Message string
	Value   interface{}
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf(
		"field %q: %s (nilai: %v)",
		e.Field, e.Message, e.Value)
}

func buatMahasiswa(
	nama string, ipk float64,
) (*Mahasiswa, error) {
	if nama == "" {
		return nil, &ValidationError{
			Field:   "Nama",
			Message: "tidak boleh kosong",
			Value:   nama,
		}
	}
	if ipk < 0 || ipk > 4 {
		return nil, &ValidationError{
			Field:   "IPK",
			Message: "harus 0.0–4.0",
			Value:   ipk,
		}
	}
	return &Mahasiswa{Nama: nama, IPK: ipk}, nil
}

func main() {
	// Cek tipe error
	m1, err := buatMahasiswa("Dimas", 3.1)
	var valErr *ValidationError
	if errors.As(err, &valErr) {
		fmt.Println("Field:", valErr.Field)
	} else {
		fmt.Println(m1)
	}
}
