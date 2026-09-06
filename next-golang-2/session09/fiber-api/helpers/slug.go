package helpers

import (
	"regexp"
	"strings"
)

// nonSlugChar: apa pun yang bukan huruf/angka dianggap pemisah.
var nonSlugChar = regexp.MustCompile(`[^a-z0-9]+`)

// Slugify mengubah nama kategori jadi slug URL-friendly.
//
//	"Alat Rumah Tangga"  -> "alat-rumah-tangga"
//	"  Kopi & Teh!! "    -> "kopi-teh"
//
// Dipakai supaya client tidak perlu mengirim slug manual — slug selalu
// diturunkan dari nama, jadi bentuknya konsisten.
func Slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonSlugChar.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}
