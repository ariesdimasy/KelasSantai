package main

import (
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID   int
	Data int
}

type Result struct {
	JobID  int
	Output int
}

// Worker: ambil job dari jobs, proses, kirim result
func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()         // dijalankan bilsa for loop sudah selesai
	for job := range jobs { // blok sampai ada job atau jobs ditutup
		fmt.Printf("Worker %d memproses Job #%d (data: %d)\n",
			id, job.ID, job.Data)

		// Simulasi pemrosesan (misalnya: kuadratkan angka)
		time.Sleep(time.Duration(job.Data*10) * time.Millisecond)
		output := job.Data * job.Data

		// result struct dimasukkan kedalam channel results
		results <- Result{JobID: job.ID, Output: output}
	}
	fmt.Printf("Worker %d selesai\n", id)
}

func main() {
	jumlahWorker := 3 // kasir ada 3
	jumlahJob := 9    // pelanggan

	jobs := make(chan Job, jumlahJob)       // buffered channel dengan 9 capacity
	results := make(chan Result, jumlahJob) // beffered channel dengan 9 capacity

	// Mulai worker goroutines
	var wg sync.WaitGroup
	// membuat si kasir ( kasir capacity )
	for i := 1; i <= jumlahWorker; i++ {
		wg.Add(1) // add 1
		go worker(i, jobs, results, &wg)
	}

	// Kirim semua job
	for j := 1; j <= jumlahJob; j++ {
		jobs <- Job{ID: j, Data: j}
	}
	close(jobs) // Signal ke worker: tidak ada job lagi

	// Tunggu semua worker selesai, lalu tutup results
	go func() {
		wg.Wait()
		close(results)
	}()

	// Kumpulkan semua hasil
	fmt.Println("\n=== HASIL ===")
	for result := range results {
		fmt.Printf("Job #%d: %d^2 = %d\n",
			result.JobID, result.JobID, result.Output)
	}
}
