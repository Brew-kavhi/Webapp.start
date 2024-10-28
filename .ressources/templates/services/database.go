package openapi

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DBHandler struct {
	DB *gorm.DB
}
// automigrate function
// get user By Id
// Add new user
// Delete user 

func ({{MODULE}}DB *DBHandler) AutoMigrate() {
	{{MODULE}}DB.DB.AutoMigrate(&{{CAP_MODULE}}{})
}

func ({{MODULE}}DB *DBHandler) InitConnection() {
	fmt.Println("init connection")
	db, err := gorm.Open(sqlite.Open("../{{MODULE}}.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	{{MODULE}}DB.DB = db
}

func ({{MODULE}}DB *DBHandler) Get{{CAP_MODULE}}ById({{MODULE}}Id uint) (*{{CAP_MODULE}}, error) {
	var {{MODULE}} {{CAP_MODULE}}
	if err := {{MODULE}}DB.DB.First(&{{CAP_MODULE}}{}, {{MODULE}}Id).Error; err != nil {
		return nil, err
	}
	return &{{MODULE}}, nil
	
}

func ({{MODULE}}DB *DBHandler) GetAll{{CAP_MODULE}}() (*[]{{CAP_MODULE}}, error) {
	var {{MODULE}}s []{{CAP_MODULE}}
	if err := {{MODULE}}DB.DB.Find(&{{MODULE}}s).Error; err != nil {
		return nil, err
	}
	return &{{MODULE}}s, nil
	
}
