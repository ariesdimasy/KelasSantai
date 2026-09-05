// middlewares/auth_middleware.go
//
// Tiga middleware autentikasi:
//
//	Protected() — wajib login. Token tidak ada/tidak valid -> 401.
//	AdminOnly() — wajib login DAN role admin. Bukan admin -> 403.
//	Optional()  — kalau ada token dipakai, kalau tidak ada request tetap lanjut.
//
// Bedanya 401 dan 403:
//
//	401 Unauthorized — "saya tidak tahu kamu siapa" (belum login)
//	403 Forbidden    — "saya tahu kamu siapa, tapi kamu tidak berhak"
package middlewares
