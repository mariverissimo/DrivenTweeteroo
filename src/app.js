import express from 'express';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import { configDotenv } from 'dotenv';

const app = express();
const Joi = require('joi');
require('dotenv').config();
const PORT = process.env.PORT;
const client = new MongoClient(process.env.DATABASE_URL);

app.use(express.json());

const userSchema = Joi.object({
    username: Joi.string().required(),
    avatar: Joi.string().uri().required(),
  });

  async function connectDB() {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
      process.exit(1);  // Exit if we can't connect to the database
    }
  }

  connectDB();

  app.post('/sign-up', async (req, res) => {
    const { error, value } = userSchema.validate(req.body);
  
    if (error) {
      return res.status(422).send({ error: error.details[0].message });
    }
  
    const { username, avatar } = value;
  
    try {
      const db = client.db();
      const usersCollection = db.collection('users');
  
      
      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return res.status(409).send({ error: 'User already exists' });
      }
  
      const result = await usersCollection.insertOne({ username, avatar });
  
      return res.status(201).send({ message: 'User created successfully', userId: result.insertedId });
    } catch (err) {
      console.error('Error saving user:', err);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  });
  

app.get('/items', (req, res) =>{
  const { type } = req.query;

  if (type) {
    const filteredItems = items.filter(item => item.type === type);
    return res.status(200).json(filteredItems);
  }

  res.status(200).json(items);

});


app.get('/items/:id', (req, res) =>{
  const id = parseInt(req.params.id);

  if (isNaN(id) || id < 0) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const item = items.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({ error: "Não há nenhum item com este id." });
  }

  res.status(200).json(item);
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });