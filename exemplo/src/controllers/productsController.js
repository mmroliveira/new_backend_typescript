const connection_db = require("../database/connection_db");

module.exports = {
	async getProducts(request, response) {
		try {
			const category = await connection_db("category").select(
				"category_id",
				"category_name",
				"category_image_url"
			);

			let data = [];
			let products_array = [];
			let obj = { title: "", data: [] };

			for (var i = 0; i < category.length; i++) {
				let products = await connection_db("products")
					.where({ fk_category_id: category[i].category_id })
					.select(
						"product_id",
						"product_name",
						"product_value",
						"fk_category_id",
						"product_image_url",
						"product_additional",
						"product_description"
					);

				obj = {
					title: category[i].category_name,
					data: products,
				};

				data.push(obj);
			}
			return response.status(200).send(data);
		} catch (error) {
			return response.status(500).send(error);
		}
	},
};
