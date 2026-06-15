package handler

import (
	"sample-gorm/database"
	"sample-gorm/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category

	keyword := c.Query("keyword", "")
	page, _ := strconv.ParseUint(c.Query("page", "1"), 10, 64)
	limit, _ := strconv.ParseUint(c.Query("limit", "10"), 10, 64)
	sortBy := c.Query("sort_by", "id")
	sortOrder := c.Query("sort_order", "desc")

	// Query COUNT - query terpisah sendiri
	var total int64
	countQuery := database.DB.Model(&models.Category{})
	if keyword != "" {
		countQuery = countQuery.Where("name LIKE ?", "%"+keyword+"%")
	}
	if err := countQuery.Count(&total).Error; err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   err.Error(),
		})
	}

	// Query FIND - query terpisah sendiri, tidak ada shared state dengan countQuery
	offset := (page - 1) * limit
	findQuery := database.DB.Model(&models.Category{})
	if keyword != "" {
		findQuery = findQuery.Where("name LIKE ?", "%"+keyword+"%")
	}
	if err := findQuery.Order(sortBy + " " + sortOrder).Offset(int(offset)).Limit(int(limit)).Find(&categories).Error; err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   categories,
		"metadata": fiber.Map{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	})
}

func CreateCategory(c *fiber.Ctx) error {
	var category models.CategoryRequest

	err := c.BodyParser(&category) // request body
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   err,
		})
	}

	db_res := database.DB.Create(&models.Category{Name: category.Name}) // insert to DB
	if db_res.Error != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   db_res.Error,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   category,
	})
}

func UpdateCategory(c *fiber.Ctx) error {
	var category models.CategoryRequest

	err := c.BodyParser(&category) // request body
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   err,
		})
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   err,
		})
	}
	var category_data models.Category
	db_res := database.DB.Where("id = ?", id).First(&category_data)
	if db_res.Error != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   "Category not found",
		})
	}

	category_data.Name = category.Name

	db_res = database.DB.Save(&category_data)
	if db_res.Error != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   db_res.Error,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   category_data,
	})
}

func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	db_res := database.DB.Where("id = ?", id).Delete(&models.Category{})
	if db_res.Error != nil {
		return c.JSON(fiber.Map{
			"status": "error",
			"data":   db_res.Error,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   "Category deleted",
	})
}
