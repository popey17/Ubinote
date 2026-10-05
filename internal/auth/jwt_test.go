package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestJwt(t *testing.T) {
	id := uuid.MustParse("125f8ec3-5699-46b1-aacf-9b12856038ba")

	tests := []struct {
		name            string
		user_ID         uuid.UUID
		jwt_secret      string
		validate_secret string
		duration        time.Duration
		wantErr         bool
	}{
		{"ok", id, "jwt_secret", "jwt_secret", 2 * time.Minute, false},
		{"wrong secret", id, "jwt_secret", "wrong_secret", 2 * time.Minute, true},
		{"expired token", id, "jwt_secret", "jwt_secret", -1 * time.Millisecond, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := CreateToken(tt.user_ID, tt.jwt_secret, tt.duration)
			if err != nil {
				t.Fatalf("CreateToken() error = %v", err)
			}

			user_ID, err := ValidateToken(token, tt.validate_secret)
			if (err != nil) != tt.wantErr {
				t.Fatalf("ValidateToken() error = %v, wantErr %v", err, tt.wantErr)
			}

			if tt.wantErr {
				return
			}

			if user_ID != tt.user_ID {
				t.Fatalf("want user id %s but get %s instead", tt.user_ID, user_ID)
			}
		})
	}

}

func TestValidateToken_Tampered(t *testing.T) {
	id := uuid.MustParse("125f8ec3-5699-46b1-aacf-9b12856038ba")
	secret := "jwt_secret"
	token, err := CreateToken(id, secret, 2*time.Minute)
	if err != nil {
		t.Fatalf("CreateToken: %v", err)
	}
	raw := []byte(token)
	i := len(raw) / 2
	if raw[i] == 'a' {
		raw[i] = 'b'
	} else {
		raw[i] = 'a'
	}
	tampered := string(raw)
	_, err = ValidateToken(tampered, secret)
	if err == nil {
		t.Fatal("expected error for tampered token, got nil")
	}
}
