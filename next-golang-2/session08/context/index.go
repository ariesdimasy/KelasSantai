package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func prosesLama(ctx context.Context, id int) error {
	select {
	case <-time.After(2 * time.Second):
		fmt.Printf("Job %d selesai\n", id)
		return nil
	case <-ctx.Done():
		fmt.Printf("Job %d dibatalkan: %v\n", id, ctx.Err())
		return ctx.Err()
	}
}

func main() {
	// Context dengan timeout 1 detik
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second) // kelar 1 mili
	defer cancel()                                                          // PENTING: selalu defer cancel()!

	var wg sync.WaitGroup
	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			prosesLama(ctx, id)
		}(i)
	}
	wg.Wait()
}
