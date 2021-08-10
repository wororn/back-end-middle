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

module.exports = { mapDBToModel, mapDBToModelFull };