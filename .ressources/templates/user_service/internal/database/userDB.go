package database

import (
	"fmt"
	"time"
	"user/internal/models"
	"user/internal/utils"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type UserDB struct {
	DB *gorm.DB
}

func (userDB *UserDB) AutoMigrate() {
	userDB.DB.AutoMigrate(&models.User{})
	userDB.DB.AutoMigrate(&models.PasswordResetToken{})
}

func (userDB *UserDB) InitConnection() {
	fmt.Println("init connection")
	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	userDB.DB = db
}

func (userDB *UserDB) GetUserById(userId uint) (*models.User, error) {
	var user models.User
	if err := userDB.DB.First(&user, userId).Error; err != nil {
		return nil, err
	}
	return &user, nil

}

func (userDB *UserDB) GetUser(email string) (*models.User, error) {
	var user models.User
	if err := userDB.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (userDB *UserDB) UserExists(email string) (bool, error) {
	var user models.User
	// Use GORM's First method to find the user by email
	if err := userDB.DB.Where("email = ?", email).First(&user).Error; err != nil {
		// If the error is a record not found error, return false, no error
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		// Return false and the error if there's another issue
		return false, err
	}
	// Return true if the user is found
	return true, nil
}

func (userDB *UserDB) AddUser(user *models.User) error {
	userExists, err := userDB.UserExists(user.Email)
	if !userExists {
		return userDB.DB.Create(user).Error
	}
	return err
}

func (userDB *UserDB) UpdateUser(user *models.User) error {
	return userDB.DB.Model(&user).Updates(&user).Error
}

func (userDB *UserDB) DeleteUser(userID uint, password string) error {
	fmt.Printf("%v", userID)
	user, err := userDB.GetUserById(userID)
	if err != nil {
		return err
	}
	passwordErr := utils.CheckPassword(user.PasswordHash, password)
	if passwordErr != nil {
		return passwordErr
	}
	deleteErr := userDB.DB.Delete(&models.User{}, userID).Error
	if deleteErr != nil {
		return deleteErr
	}
	return nil
}

func (userDB *UserDB) GetTokenForUser(userID uint) (models.PasswordResetToken, error) {
	var token models.PasswordResetToken
	err := userDB.DB.Where("user_id = ?", userID).Last(&token).Error
	return token, err
}

func (userDB *UserDB) StoreToken(userID uint, token string, tokenDuration int) error {
	var time = time.Now().Add(time.Minute * time.Duration(tokenDuration))
	resetToken := &models.PasswordResetToken{
		UserID: userID,
		Token:  token,
		Expire: time,
	}
	createErr := userDB.DB.Create(&resetToken).Error
	return createErr
}

func (userDB *UserDB) Validate2FA(userID uint, code string) (bool, error) {
	user, err := userDB.GetUserById(userID)
	if err != nil {
		fmt.Println(err)
		return false, err
	}
	if user.Enable2FA {
		// validate the token
		return utils.VerifyTOTPCode(user.SecondFactor, code), nil
	} else {
		return true, nil
	}
}
