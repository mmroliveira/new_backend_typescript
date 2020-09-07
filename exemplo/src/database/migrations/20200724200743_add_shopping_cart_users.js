exports.up = function (knex) {
	return knex.schema.table('user', function (table) {
		table.json('shopping_cart');
	});
};


exports.down = function(knex) {
    return knex.schema.table('user', function(table) {
        table.dropColumn('shopping_cart');
    });
};
