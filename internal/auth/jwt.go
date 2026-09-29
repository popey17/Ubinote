package auth

import (
	"time"

	"github.com/google/uuid"
)

func CreateToken(userID uuid.UUID, secret string, tl time.Duration) (string, error) {

}
