import express from 'express';
import { MongoClient } from 'mongodb';
import Joi from 'joi';
import { config } from 'dotenv';

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
      process.exit(1);
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
  

  app.post('/tweets', async (req, res) => {
    const { username, tweet } = req.body
  
    const { error } = tweetSchema.validate({ username, tweet })
    if (error) return res.status(422).send("Dados inválidos")
  
    try {
     
      const userExists = await db.collection('users').findOne({ username })
  
      if (!userExists) {
        return res.status(401).send("Usuário não autorizado")
      }
  
    
      await db.collection('tweets').insertOne({ username, tweet })
  
      res.status(201).send("Tweet criado com sucesso")
    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  })


  app.get('/tweets', async (req, res) => {
    try {
      const tweets = await db
        .collection('tweets')
        .find()
        .sort({ _id: -1 })
        .toArray()
  
      const enrichedTweets = await Promise.all(
        tweets.map(async (tweet) => {
          const user = await db.collection('users').findOne({ username: tweet.username })
  
          return {
            _id: tweet._id,
            username: tweet.username,
            avatar: user?.avatar || '',
            tweet: tweet.tweet
          }
        })
      )
  
      res.send(enrichedTweets)
    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  });

  app.put('/tweets/:id', async (req, res) => {
    const { id } = req.params
    const { username, tweet } = req.body
  
    const { error } = tweetSchema.validate({ username, tweet })
    if (error) return res.status(422).send("Dados inválidos")
  
    try {

      const existingTweet = await db.collection('tweets').findOne({ _id: new ObjectId(id) })
  
      if (!existingTweet) {
        return res.status(404).send("Tweet não encontrado")
      }
  
      await db.collection('tweets').updateOne(
        { _id: new ObjectId(id) },
        { $set: { username, tweet } }
      )
  
      res.sendStatus(204)
    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  });
  


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });