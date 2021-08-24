/* eslint-disable camelcase */


exports.up = pgm => {

    pgm.createTable('songs', {
        id: {
          type: 'VARCHAR(50)',
          primaryKey: true,
        },
        title: {
          type: 'TEXT',
          notNull: true,
        },
        year: {
          type: 'INTEGER',
          notNull: true,
        },
        performer: {
          type: 'TEXT',
          notNull: true,
        },
        genre: {
          type: 'TEXT',
        },
        duration: {
          type: 'INTEGER',
        },
        insertedAt: {
          type: 'TEXT',
          notNull: true,
        },
        updatedAt: {
          type: 'TEXT',
          notNull: true,
        },
      });
  
};

exports.down = pgm => {
    pgm.dropTable('songs');

};
