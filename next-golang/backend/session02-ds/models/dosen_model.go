package models

type Dosen struct {
	Person
	Email       string
	Password    string
	Jurusan     string
	Aktif       bool
	Sertifikasi string
}
