package utils

import "fmt"

func GetUserIdFromContext(ctx map[string]interface{}) (uint, error) {
	if userId, ok := ctx["user_id"].(uint); ok {
		return userId, nil
	}
	return 0, fmt.Errorf("no user_id found in context")
}
