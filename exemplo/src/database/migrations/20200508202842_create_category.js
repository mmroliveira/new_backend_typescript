
exports.up = function(knex) {
	return knex.schema.createTable('category', function (table){
		table.string('category_id').primary().notNullable();
        table.string('category_name').notNullable().unique();
        table.string('category_original_image_name').notNullable();
        table.string('category_image_path').notNullable();
        table.string('category_image_url').notNullable();
        
        table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
        table.timestamp('updated_at', { precision: 0 }).defaultTo(knex.fn.now(0));
      });
};

exports.down = function(knex) {
	return knex.schema.dropTable('category')
};
