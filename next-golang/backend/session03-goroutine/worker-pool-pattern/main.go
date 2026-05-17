package main

import (
	"fmt"
	"sync"
	"time"
)

type Job struct{ ID, Data int } // channel untuk kirim job ke worker
type Result struct{ JobID, Output int }

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()         // clean up: beri tahu WaitGroup saat selesai
	for job := range jobs { // blok sampai ada job atau jobs ditutup
		time.Sleep(time.Duration(job.Data*10) * time.Millisecond)
		results <- Result{JobID: job.ID, Output: job.Data * job.Data}
		fmt.Printf("  [W%d] Job#%d → %d\n", id, job.ID, job.Data*job.Data)
	}
}

func main() {
	const numWorker = 3
	const numJob = 9

	jobs := make(chan Job, numJob)       // buffered // pengirim
	results := make(chan Result, numJob) // buffered // penerima

	var wg sync.WaitGroup
	// 1. Jalankan N worker
	for i := 1; i <= numWorker; i++ {
		wg.Add(1)
		go worker(i, jobs, results, &wg)
	}

	// 2. Kirim semua job ke channel
	for j := 1; j <= numJob; j++ {
		jobs <- Job{ID: j, Data: j}
	}
	close(jobs) // signal worker: tidak ada job lagi!

	// 3. Tunggu semua worker selesai, lalu close results
	go func() { wg.Wait(); close(results) }()

	// 4. Kumpulkan semua hasil
	for r := range results {
		fmt.Printf("Job #%d: hasil = %d\n", r.JobID, r.Output)
	}
}
