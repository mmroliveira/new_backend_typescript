const connection_db = require("../database/connection_db");

module.exports = {
	async getCategory(request, response) {
		try {
			const data = await connection_db("category").select(
				"category_id",
				"category_name",
				"category_image_url"
			);
			return response.status(200).send(data);
		} catch (error) {
			return response.status(500).send(error);
		}
	},
};
