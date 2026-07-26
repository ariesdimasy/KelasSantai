package main

import "fmt"

func main() {
	/*
		1. awalan
		2. akhiran
		3. step
		4. arah ( maju / mundur )
	*/

	for i := 1; i < 5; i++ {
		fmt.Println("iteration ke : ", i)
	}

	j := 1      // awalan
	for j < 5 { // akhiran
		fmt.Println("iteration ke : ", j)
		j++
	}
}
