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

type CreateProductRequest struct {
	Name  string `json:"name" validate:"required,min=5,max=100"`
	Price int    `json:"price" validate:"required,gt=0"`
}
