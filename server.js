require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;

  // filter our pokemon by name if name query param is present
  if (req.query.name) {
    response = response.filter(pokemon =>
      // case insensitive searching
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    )
  }

  // filter our pokemon by type if type query param is present
  if (req.query.type) {
    response = response.filter(pokemon =>
      pokemon.type.includes(req.query.type)
    )
  }

  res.json(response)
}

app.get('/pokemon', handleGetPokemon)

app.use((errror, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
});