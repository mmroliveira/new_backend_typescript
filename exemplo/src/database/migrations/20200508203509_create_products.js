exports.up = function (knex) {
	return knex.schema.createTable("products", function (table) {
		table.string("product_id").primary().notNullable();
		table.string("product_name").notNullable().unique();
		table.string("product_description").notNullable();
		table.string("product_value").notNullable();
		table.string("product_image_path");
		table.string("product_image_url");

		table.json("product_additional");

		table.string("fk_category_id").notNullable();
		table
			.foreign("fk_category_id")
			.references("category_id")
			.inTable("category");

		table.timestamp("created_at", { precision: 0 }).defaultTo(knex.fn.now(0));
		table.timestamp("updated_at", { precision: 0 }).defaultTo(knex.fn.now(0));
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable("products");
};
