package auth

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	_, err := Hashpassword("secret123")
	if err != nil {
		t.Fatalf("hash: %v", err)
	}
}

func TestCheckPassword(t *testing.T) {
	tests := []struct {
		name     string
		original string
		input    string
		want     bool
	}{
		{"correct password", "secret_password", "secret_password", true},
		{"wrong password", "secret_password", "secret_random", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hash, err := Hashpassword(tt.original)
			if err != nil {
				t.Fatalf("setup: HashPassword() error = %v", err)
			}

			got, err := CheckPassword(hash, tt.input)
			if got != tt.want {
				t.Errorf("CheckPassword(%q) = %v, want %v", tt.input, got, tt.want)
			}
			if tt.want && err != nil {
				t.Errorf("CheckPassword(%q) error = %v", tt.input, err)
			}
		})
	}
}
