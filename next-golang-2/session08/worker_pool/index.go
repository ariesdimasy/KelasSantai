package main

import "fmt"

func main() {
	jobs := make(chan int, 5) // buffer nampung 5 job sekaligus
	// dia mengirim job
	// diterima job nya  , dimasukkan ke dalam result ( result mengirim / job di assign ke result )
	// result di terima

	results := make(chan int, 5)

	for w := 1; w <= 3; w++ {
		go worker(w, jobs, results)
	}

	for j := 1; j <= 5; j++ {
		jobs <- j // tidak blocking selama buffer belum penuh
	}
	close(jobs)

	for a := 1; a <= 5; a++ {
		fmt.Println(<-results)
	}
}

func worker(id int, jobs <-chan int, results chan<- int) {
	// j disini adalah item dari jobs
	for j := range jobs {
		results <- j * 2
	}
}
