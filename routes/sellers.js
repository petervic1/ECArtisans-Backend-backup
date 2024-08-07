const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // 加密套件
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller.js");
const Product = require("../models/product");
const Activities = require("../models/activity");

// 取得所有賣家
router.get("/", async (req, res, next) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  try {
    const sellers = await Seller.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        sellers,
      })
    );
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "server error",
    });
  }
});

// 取得單個賣家詳情
router.get("/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // 查詢單個賣家詳情
    const seller = await Seller.findById(sellerId).lean();

    if (!seller) {
      return res.status(404).json({ message: "找不到賣家" });
    }

    // 查詢賣家的所有活動
    const activities = await Activities.find({ seller_id: sellerId }).lean();

    // 提取所有活動ID和圖片
    const activitiesDetails = activities.map((activity) => ({
      activity_id: activity._id,
      activity_image: activity.activity_image,
    }));

    // 格式化賣家資料
    const formattedData = {
      seller_id: seller._id,
      activities: activitiesDetails, // 包含活動ID和圖片的陣列
      seller_image: seller.avatar,
      seller_name: seller.brand,
      seller_info: seller.introduce,
    };

    res.status(200).json({
      status: true,
      data: [formattedData],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:sellerId/products", async (req, res) => {
  try {
    const { sellerId } = req.params;

    // 查詢屬於該賣家的所有商品
    const productsQuery = Product.find({
      sellerOwned: sellerId,
      isOnshelf: true,
    }).populate({
      path: "sellerOwned",
      select: "brand",
      model: Seller,
    });

    const productsPromise = productsQuery.lean().exec();

    // 同時計算總筆數
    const [products, totalCount] = await Promise.all([
      productsPromise,
      Product.countDocuments({
        sellerOwned: sellerId,
        isOnshelf: true,
      }),
    ]);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // 格式化商品資料
    const formattedData = products.map((product) => {
      const discount = [];
      if (product.tags.includes(0)) {
        discount.push("免運券");
      }
      if (product.tags.includes(1)) {
        discount.push("折抵券");
      }

      return {
        products_id: product._id,
        products_name: product.productName,
        products_images: product.image[0],
        seller_name: product.sellerOwned.brand,
        price:
          product.format && product.format.length > 0
            ? product.format[0].price
            : null,
        total_sales: product.sold,
        discount: discount.length > 0 ? discount : null,
        star:
          product.reviews.length > 0
            ? calculateAverageRating(product.reviews)
            : 0,
      };
    });

    res.status(200).json({
      status: true,
      total_products: totalCount,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
