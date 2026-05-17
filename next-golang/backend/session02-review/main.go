package main

import "fmt"

// pointer , adalah sebuah variable yang menyimpan alamat dari variable lain
// 2 atau 3 variable yang menunjuk ke alamat yang sama, maka jika salah satu variable tersebut diubah nilainya, maka variable lainnya juga akan berubah nilainya
// ex3trefjiowjhfe <-- alamat memory

// cetakan, pencetak, pabrik , blueprint , class
// golang tidak mengimplementasikan OOP
type Person struct {
	Name string
	Age  int
}

func main() {

	var a int = 10 // alamat memory yg beda dengan variable b
	b := a

	fmt.Println(" a = ", a)
	fmt.Println(" b = ", b)

	b = 20

	fmt.Println(" a = ", a)
	fmt.Println(" b = ", b)

	// pointer
	var c int = 30
	var d *int = &c // d adalah pointer yang menyimpan alamat dari variable c

	fmt.Println(" c = ", c)
	fmt.Println(" d = ", d, *d)

	*d = 50

	fmt.Println(" c = ", c)
	fmt.Println(" d = ", d, *d)

	// passing by value

	// pointer = passing by reference

	p1 := Person{
		Name: "John",
		Age:  30,
	}

	p2 := p1 // passing by value

	p2.Name = "Rian"

	fmt.Println(" p1 = ", p1)
	fmt.Println(" p2 = ", p2)

	p3 := &p1 // passing by reference

	p3.Name = "Handi"

	fmt.Println(" p1 = ", p1)
	fmt.Println(" p3 = ", p3)

}
