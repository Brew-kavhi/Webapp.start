package main

import (
	"fmt"
	"time"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type UserDB struct {
	DB *gorm.DB
}
// automigrate function
// get user By Id
// Add new user
// Delete user 

func (userDB *UserDB) AutoMigrate() {
	userDB.DB.AutoMigrate(&User{})
	userDB.DB.AutoMigrate(&PasswordResetToken{})
}

func (userDB *UserDB) InitConnection() {
	fmt.Println("init connection")
	db, err := gorm.Open(sqlite.Open("user.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	userDB.DB = db
}

func (userDB *UserDB) GetUserById(userId uint) (*User, error) {
	var user User
	if err := userDB.DB.First(&user, userId).Error; err != nil {
		return nil, err
	}
	return &user, nil
	
}

func (userDB *UserDB) GetUser(email string) (*User, error) {
	var user User
	if err := userDB.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (userDB *UserDB) UserExists(email string) (bool, error) {
    var user User
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

func (userDB *UserDB) AddUser(user *User) (error) {
	userExists, err := userDB.UserExists(user.Email)
	if !userExists {
		return userDB.DB.Create(user).Error
	}
	return err	
}

func (userDB *UserDB) UpdateUser(user *User) (error) {
	return userDB.DB.Model(&user).Updates(&user).Error
}

func (userDB *UserDB) DeleteUser(userID uint, password string) (error) {
	fmt.Printf("%v", userID)
	user, err := userDB.GetUserById(userID)
	if err != nil {
		return err
	}
	passwordErr := CheckPassword(user.PasswordHash, password)
	if passwordErr != nil {
		return passwordErr
	}
	deleteErr := userDB.DB.Delete(&User{},userID).Error
	if deleteErr != nil {
		return deleteErr
	}
	return nil	
}

func (userDB *UserDB) GetTokenForUser(userID uint) (PasswordResetToken, error) {
	var token PasswordResetToken
	fmt.Printf("%v", tokenDuration)
	err := userDB.DB.Where("user_id = ?", userID).Last(&token).Error
	fmt.Printf("%v", token)
	return token, err
}

func (userDB *UserDB) StoreToken(userID uint, token string) (error) {
	fmt.Printf("%v", tokenDuration)
	var time = time.Now().Add(time.Minute * time.Duration(tokenDuration))
	resetToken := &PasswordResetToken{
		UserID: userID,
		Token: token,
		Expire: time,
	}
	createErr := userDB.DB.Create(&resetToken).Error
	return createErr
}

func (userDB *UserDB) Validate2FA(userID uint, code string) (bool, error){
	user, err := userDB.GetUserById(userID)
	if err != nil {
		fmt.Println(err)
		return false, err
	}
	if user.Enable2FA {
		// validate the token
		return VerifyTOTPCode(user.SecondFactor, code), nil
	} else {
		return true, nil
	}
}
