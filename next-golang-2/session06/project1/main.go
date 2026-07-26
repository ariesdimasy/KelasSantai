package main

import (
	"fmt" // library bawaan
	"reflect"
)

// function main()
// function yang pertama kali di eksekusi
func main() {

	// variable , name adalah variable name
	var name string = "Dimas" // data type string,  deklarasi dengan cara eksplisit
	age := 30                 // assign as data type
	var isMarried bool        // secara default boolean bernilai false

	var (
		a int = 10
		b int = 20
		c int = 30
	)

	// Println adalah method bawaan yang berasal dari library fmt
	fmt.Println("Selamat belajar golang")
	fmt.Println("golang sangat mudah")
	fmt.Printf("nama : %s ", name)
	fmt.Printf("age : %d", age)
	fmt.Println("is married ? ", isMarried)
	fmt.Println(a, b, c)

	name = "Rian"

	fmt.Println(name)

	const PI = 3.14
	// PI = 5
	fmt.Println(PI)

	// tipe data primitive
	var num1 uint = 10
	var setting bool = true
	fmt.Println(num1)
	fmt.Println(setting)

	fmt.Println(reflect.TypeOf(num1))
	fmt.Println(reflect.TypeOf(PI))

	// operasi aritmatika
	fmt.Println(2 + 2)
	fmt.Println(2 / 2)
	fmt.Println(2 * 2)
	fmt.Println(5 % 3) // 5 modulus 3 , 5 / 3 = 1 , 5 - (3*1) = 2

	// operasi ( comparison )
	fmt.Println("Comparison Operator") // hasilnya selalu boolean
	fmt.Println(2 == 2)                // true
	fmt.Println(2 != 2)
	fmt.Println(2 > 2)
	fmt.Println(2 >= 2)
	fmt.Println(2 < 2)
	fmt.Println(2 <= 2)
}
