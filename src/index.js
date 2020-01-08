import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';

import schemas from './schemas';
import resolvers from './resolvers';

import userModel from './models/userModel';
import bookModel from './models/bookModel';
import commentModel from './models/commentModel';

const app = express();
app.use(cors());

const getUser = async req => {
  const token = req.headers['token'];

  if (token) {
    try {
      return await jwt.verify(token, 'riddlemethis');
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  context: async ({ req }) => {
    if (req) {
      const me = await getUser(req);

      return {
        me,
        models: {
          userModel,
          bookModel,
          commentModel
        }
      };
    }
  }
});

server.applyMiddleware({ app, path: '/graphql' });

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);

app.listen(5000, () => {
  mongoose.connect('mongodb+srv://dev:dev@cluster0-qhiqu.mongodb.net/library')
});
