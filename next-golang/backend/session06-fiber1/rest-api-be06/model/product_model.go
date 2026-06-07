package model

type Product struct {
	Id    int    `json:"id"`
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type ProductRequest struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}
