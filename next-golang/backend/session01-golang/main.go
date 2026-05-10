package main

import (
	"fmt"
	"reflect"
	"strconv"
)

func main() {
	fmt.Println("Name : Aries Dimas")

	fmt.Print("Tanpa new line")
	fmt.Printf(" Nama : %s, Umur : %d  \n", "Budi", 25)

	var name string = ""
	var age int = 35
	var isMarried bool = true

	fmt.Printf(" Nama : %s \n ", name)
	fmt.Printf(" Age : %d \n ", age)
	fmt.Printf(" Married : %d \n ", isMarried)

	address := "Tangerang"
	num := 34
	fmt.Println(address)
	fmt.Println(num)

	var (
		a int = 10
		b int = 20
		c int = 30
	)
	fmt.Println(a + b + c)

	d, e, f := 40, 50, 60

	fmt.Println(d + e + f)

	fmt.Println(" d = ", d)

	d = 60 // d nilainya diubah menjadi 60

	fmt.Println(" d = ", d)

	const PI float32 = 3.14

	// PI = 6

	// println(PI)

	fmt.Println(float32(d))
	// fmt.Println(int( float32(3.14)))
	fmt.Println(reflect.TypeOf(strconv.Itoa(45)))
	fmt.Println(byte('A'), byte('a'))

	fmt.Println(" d + e = ", d+e)
	fmt.Println(" d - e = ", d-e)
	fmt.Println(" d * e = ", d*e)
	fmt.Println(" d / e = ", d/e)
	fmt.Println(" d "+"%"+" e = ", d%e)

	g := 20
	g++
	fmt.Println(g)
	g--
	fmt.Println(g)

	// logika operator
	fmt.Println(" d > e = ", d > e)
	fmt.Println(" d >= e = ", d >= e)
	fmt.Println(" d < e = ", d < e)
	fmt.Println(" d <= e = ", d <= e)
	fmt.Println(" d == e = ", d == e)
	fmt.Println(" d != e = ", d != e)

	// gerbang logika
	fmt.Println(true && true)
	fmt.Println(true && false)
	fmt.Println(true || true)
	fmt.Println(true || false)

	/* conditional statement */
	if true {
		fmt.Println("Saya akan selalu true")
	}

	if name != "" {
		fmt.Println("Welcome, ", name)
	} else {
		fmt.Println("name must be filled ")
	}

	color := "red"

	if color == "red" {
		fmt.Println("you must stop")
	} else if color == "yellow" {
		fmt.Println("Be careful")
	} else {
		fmt.Println("you must go")
	}

	switch color {
	case "red":
		fmt.Println("you must stop")

	case "yellow":
		fmt.Println("Be careful")

	case "green":
		fmt.Println("You must go")
	default:
		fmt.Println("only use valid color")
	}

	nilai := 85
	switch {
	case nilai >= 90:
		fmt.Println("A")
	case nilai >= 80:
		fmt.Println("B")
	case nilai >= 70:
		fmt.Println("C")
	default:
		fmt.Println("D")
	}

	// Loop

	for i := 0; i <= 10; i++ {
		fmt.Println(i)
	}

	// loop gaya while
	angka := 1
	for angka <= 10 {
		fmt.Print(angka, " ")
		angka++
	}

	// for {
	// 	fmt.Print("Angka (0=berhenti): ")
	// 	var n int
	// 	fmt.Scan(&n)
	// 	if n == 0 {
	// 		break
	// 	} // keluar loop
	// 	if n < 0 {
	// 		continue
	// 	} // skip iterasi ini
	// 	fmt.Println("Kuadrat:", n*n)
	// }

	for i := 1; i <= 3; i++ {
		for j := 1; j <= 3; j++ {
			fmt.Println(i, " x ", j, " = ", i*j)
		}
	}

	// func
	fmt.Println(multiply(4, 5))
	fmt.Println(multiply(10, 7))

	quickMaff()

	// Write once , run everywhere
	fmt.Println(bagi(6, 0))

	// fmt.Println(quickMaff()) gak ada return di print, error

	calculatorBMI()
}

// a dan b adalah parameter , yang tipe nya adalah integer
// multiply adalah nama function nya
// lalu integer yang paling kanan adalah return type nya ( type data hasil proses function )

func multiply(a int, b int) int {
	return a * b
}

func quickMaff() {
	fmt.Println(multiply(6, 7))
}

func bagi(a, b float64) (float64, error) {
	if b == 0 {
		return a, fmt.Errorf("tidak bisa bagi dengan nol")
	}
	return a / b, nil // nil = tidak ada error
}

func calculatorBMI() {

	var bb float32
	var tinggi float32

	fmt.Print(" Berat Badan (kg) : ")
	fmt.Scan(&bb)
	fmt.Print(" Tinggi (m) : ")
	fmt.Scan(&tinggi)

	result := bb / (tinggi * tinggi)

	if result < 18.5 {
		fmt.Println(result, " underweight")
	} else if result >= 18.5 && result < 22.9 {
		fmt.Println(result, "normal")
	} else if result >= 22.9 && result < 24.9 {
		fmt.Println(result, "normal")
	} else if result >= 24.9 && result < 29.9 {
		fmt.Println(result, "Overweight")
	} else {
		fmt.Println(result, "Obesitas")
	}

}
