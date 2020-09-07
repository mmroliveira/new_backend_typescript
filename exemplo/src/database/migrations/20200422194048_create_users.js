
exports.up = function(knex) {
    return knex.schema.createTable('user', function (table){
		table.string('user_id').primary().notNullable();
        table.string('user_name').notNullable();
        table.string('user_email').notNullable().unique();
        table.string('user_phone').notNullable();
        table.string('user_password').notNullable();
        
        table.json('user_address');
        table.json('user_wishlist');

        table.string('password_reset_token');
        table.datetime('password_reset_expires', { precision: 0 });
        
        table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
        table.timestamp('updated_at', { precision: 0 }).defaultTo(knex.fn.now(0));
      });
};

exports.down = function(knex) {
	return knex.schema.dropTable('user')
};
