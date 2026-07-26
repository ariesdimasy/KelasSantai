package main

import "fmt"

func main() {

	var nama string

	fmt.Print("Nama : ")
	fmt.Scan(&nama)

	if nama == "" {
		fmt.Println("Silahkan isi nama")
		return
	}

	fmt.Println("Selamat datang ", nama)
}
