package models

type CreateProductRequest struct {
	Nama     string  `json:"nama"`
	Harga    float64 `json:"harga"`
	Stok     int     `json:"stok"`
	Kategori string  `json:"kategori"`
}
