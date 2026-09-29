package auth

import "golang.org/x/crypto/bcrypt"

func Hashpassword(plain string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)

	if err != nil {
		return "", err
	}

	return string(hash), nil
}

func CheckPassword(hash, plain string) (bool, string) {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))

	if err != nil {
		return false, err.Error()
	}

	return true, ""
}
