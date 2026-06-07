-- 10 sample blog posts about IT
-- user_id dipilih acak antara 1..10 (bisa ada duplikat)

INSERT INTO posts (id, user_id, title, content, created_at) VALUES
(1, 3, 'Mengenal Dasar-dasar AI dan Machine Learning', 'AI (kecerdasan buatan) dan machine learning mengubah cara aplikasi bekerja. Artikel ini memperkenalkan konsep supervised, unsupervised, serta contoh kasus praktis yang umum.', NOW()),
(2, 7, 'Panduan Cepat Memulai Golang untuk Pemula', 'Golang terkenal karena performa dan dukungan concurrency-nya. Pelajari struktur dasar program, modul, dan pembuatan goroutine sederhana untuk mulai membangun layanan cepat.', NOW()),
(3, 1, 'Membangun API RESTful dengan Next.js dan Go', 'Kombinasi Next.js untuk frontend dan Go untuk backend memberikan pengalaman fullstack yang efisien. Fokus pada routing, handling request, dan strategi deployment.', NOW()),
(4, 1, 'Optimasi Query MySQL untuk Performa', 'Indeks, EXPLAIN, dan normalisasi adalah kunci untuk query cepat. Artikel ini membahas teknik optimasi praktis dan contoh perubahan yang berdampak besar.', NOW()),
(5, 5, 'Dasar-dasar Docker dan Containerization', 'Docker menyederhanakan deployment dengan container ringan. Pelajari pembuatan Dockerfile, image, container, dan best practice untuk lingkungan pengembangan.', NOW()),
(6, 9, 'Memahami Konsep Concurrency di Go', 'Concurrency adalah keunggulan Go lewat goroutine dan channel. Bahas contoh pola, sinkronisasi, dan common pitfalls yang harus dihindari.', NOW()),
(7, 2, 'Pengenalan Kubernetes untuk Pengelolaan Container', 'Kubernetes mengatur orkestrasi container pada skala besar. Artikel ini menyingkap konsep Pod, Service, Deployment, dan cara mulai di lokal.', NOW()),
(8, 7, 'Pengujian Otomatis: Unit Test dan Integration Test', 'Testing meningkatkan kepercayaan saat merilis fitur. Pelajari perbedaan unit vs integration test dan contoh sederhana dengan framework populer.', NOW()),
(9, 4, 'Keamanan Aplikasi Web: Praktik Dasar', 'Keamanan harus dipikirkan sejak awal: sanitasi input, autentikasi yang kuat, dan penggunaan HTTPS. Tips praktis untuk mengurangi risiko serangan umum.', NOW()),
(10, 8, 'Membangun UI Responsif dengan Tailwind CSS', 'Tailwind mempercepat styling dengan utility-first classes. Pelajari cara struktur komponen responsif dan workflow bersama React atau Next.js.', NOW());

-- Selesai: 10 post sample

