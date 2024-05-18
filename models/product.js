// 定義模式
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formatSchema = new Schema({
	title: {
		type: String,
		required: [true, '請輸入品項名稱'],
	},
	price: {
		type: Number,
		required: [true, '請輸入價格'],
	},
	cost: {
		type: Number,
		required: [true, '請輸入成本'],
	},
	stock: {
		type: Number,
	},
	color: [String],
});
const productSchema = new Schema(
	{
		sellerOwned: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Sellers',
		},
		productName: {
			type: String,
			required: [true, '必須填寫商品名稱'],
		},
		sellerCategory: [
			{
				type: String,
				enum: [
					'娛樂',
					'服飾',
					'3C產品',
					'食品',
					'家具',
					'運動',
					'寵物',
					'生活用品',
					'清潔用品',
				],
				required: [true, '必須選擇總類別'],
			},
		],
		//商家自訂義類別
		category: [
			{
				type: String,
				required: [true, '必須填寫商品分類'],
			},
		],
		origin: {
			type: String,
		},
		ingredient: {
			type: String,
		},
		format: [formatSchema],
		introduction: {
			type: String,
		},
		production: {
			type: String,
		},
		isOnshelf: {
			type: Boolean,
			default: false,
		},
		fare: {
			type: Number,
		},
		pay: [
			{
				type: String,
				enum: ['信用卡付款', 'ATM匯款', '店到店付費'],
				required: [true, '請至少提供一種支付方式'],
			},
		],
		keyword: {
			type: [String],
		},
		image: [
			{
				type: String,
			},
		],
		//商品評價
		reviews:[
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Review',
			}
		],
		
		//已售出數量
		sold: {
			type:Number,
			default: 0,
		},
		createAt: {
			type: Date,
			default: Date.now,
			select: false,
		},
		updateAt: {
			type: Date,
			default: Date.now,
			select: false,
		},
	},
	{
		versionKey: false,
	}
);

// 計算商品評價 
// productSchema.virtual('rating').get(function() {
// 	let rating = 0;
// 	if (this.reviews.length) {
// 	  const sum = this.reviews.reduce((total, review) => total + review.rate, 0);
// 	  rating = sum / this.reviews.length;
// 	}
// 	return rating;
//   });

const Product = mongoose.model('Products', productSchema);

module.exports = Product;

//測試用

// {
//     "productName":"快速充電器",
//     "sellerCategory": "3C產品",
//     "category": "電子配件",
//     "origin": "台灣",
//     "ingredient": "高導電性合金，耐熱塑膠",
//     "format": [{
//         "title":"白色120W",
//         "price": 800,
//         "cost": 500,
//         "stock": 100,
//         "color":["白色"]
//     }],
//     "introduction":"其獨特的智能充電技術能夠自動調節電流，以達到最佳的充電效率，保護您的設備免受過充損害。此充電器小巧便攜，輕鬆放入口袋或背包，不僅適用於所有支…",
//     "production":"智能製造組裝",
//     "fare":30,
//     "pay": ["信用卡付款","ATM匯款","店到店付費"],
//     "keyword":["充電器","快充"]
// }
