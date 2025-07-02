exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  
  // Foreign key ke users
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
  
  // Foreign key ke albums
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.id', {
    foreignKeys: {
      columns: 'album_id',
      references: 'albums(id)',
      onDelete: 'cascade',
    },
  });
  
  // Unik: satu user tidak bisa like album yang sama lebih dari sekali
  pgm.addConstraint('user_album_likes', 'unique_user_album_likes', {
    unique: ['user_id', 'album_id'],
  });
};
  
exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
  