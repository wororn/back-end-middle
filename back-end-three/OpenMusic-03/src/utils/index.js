const mapDBToModel = ({
  id,
  title,
  performer
  }) => ({
  id,
  title,
  performer
});

const mapDBToModelFull = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt,
  updatedAt
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt,
  updatedAt
});


const mapDBToPlaylist = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});


module.exports = { mapDBToModel, mapDBToModelFull,mapDBToPlaylist };