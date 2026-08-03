package main

import (
	"fmt"
	"time"
)

// Timeout menggunakan time.After
func requestDenganTimeout(url string, timeout time.Duration) (string, error) {
	hasilCh := make(chan string, 1)

	go func() {
		// Simulasi HTTP request
		time.Sleep(300 * time.Millisecond)
		hasilCh <- "data dari " + url
	}()

	select {
	case hasil := <-hasilCh:
		return hasil, nil
	case <-time.After(timeout):
		return "", fmt.Errorf("timeout setelah %v", timeout)
	}
}

func main() {
	hasil, err := requestDenganTimeout("api.example.com", 300*time.Millisecond)
	if err != nil {
		fmt.Println("Error:", err) // timeout setelah 200ms
		return
	}
	fmt.Println(hasil)
}
