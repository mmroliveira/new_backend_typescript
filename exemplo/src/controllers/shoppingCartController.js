const connection_db = require("../database/connection_db");

module.exports = {
	async setShoppingCart(request, response) {
		try {
			const { user_id, data } = request.body;

			await connection_db("user")
				.where({ user_id: user_id })
				.update({ shopping_cart: await JSON.stringify(data) });

			return response.status(200).send({ messageTitle: "deu certo" });
		} catch (error) {
			return response.status(500).send({ error: "Internal error" });
		}
	},

	async getShoppingCart(request, response) {
		try {
			const { user_id } = request.body;

			const [shoppingCart] = await connection_db("user")
				.where({ user_id: user_id })
				.select("shopping_cart");

			return response.status(200).send(shoppingCart);
		} catch (error) {
			return response.status(500).send({ error: "Internal error" });
		}
	},

	async deleteShoppingCartProduct(request, response) {
		try {
			const { user_id } = request.params;

			const product_id = request.headers.authorization;
			console.log(product_id);

			const [data] = await connection_db("user")
				.where({ user_id: user_id })
				.select("shopping_cart");

			// filtrando todos os elementos que são diferentes do que
			// o usuario deseja remover.
			let newData = data.shopping_cart.filter(function (item) {
				return item.product_id !== product_id;
			});

			await connection_db("user")
				.where({ user_id: user_id })
				.update({ shopping_cart: await JSON.stringify(newData) });

			return response.status(200).send({ messageTitle: "deu certo" });
		} catch (error) {
			return response.status(500).send({ messageTitle: "Internal error" });
		}
	},
};
