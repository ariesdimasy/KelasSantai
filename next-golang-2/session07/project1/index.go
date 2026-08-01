package main

import "fmt"

// struct berisi property
type Person struct {
	ID     int
	Name   string
	Email  string
	Gender string
}

// interface berisi method
type personAction interface {
	running()
	calculatedBMI(weight int, height int) int
}

func (p Person) running() {
	fmt.Println(p.Name, " is running")
}

func (p Person) calculatedBMI(weight float32, height float32) float32 {
	return weight / (height * height)
}

func main() {

	person1 := Person{
		ID:     1,
		Name:   "Dimas",
		Email:  "dimas@gmail.com",
		Gender: "male",
	}

	fmt.Println(person1)

	person1.running()
	fmt.Println(person1.calculatedBMI(80, 1.7))

	// var name = "dimas"
	// var name2 = name // passsing by value

	// fmt.Println(name2)

	// name = "rian"

	// fmt.Println(name2)

	// passing by reference
	var name = "dimas"
	var name2 = &name

	fmt.Println(name2)  // alamat memory , dari variable name
	fmt.Println(*name2) // value dari name2

	name = "rian"

	fmt.Println(*name2)

}
