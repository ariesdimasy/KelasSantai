package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
)

type Users struct {
	ID       int
	Name     string
	Email    string
	Password string
}

func main() {
	dsn := "root:@tcp(localhost:3306)/mydb"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Successfully connected to database")

	// ========== start fiber ==============

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Get("/users", func(c *fiber.Ctx) error {
		var users []Users

		rows, err := db.Query("SELECT * FROM users")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		for rows.Next() {
			var u Users
			if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Password); err != nil {
				log.Fatal(err)
			}
			users = append(users, u)
		}

		return c.JSON(users)
	})
	// c.parms("email") = dimas@gmail.com OR 1=1 " --
	app.Get("/auth/login", func(c *fiber.Ctx) error {
		rows, err := db.Query("SELECT * FROM users WHERE email = " + c.Params("email") + " AND password = " + c.Params("password"))
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

	})

	app.Listen(":8080")

}
