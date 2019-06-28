import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver } from 'graphql-sequelize';
import models from './models';

const typeDefs = `
  type Query {
    pet(id: ID!): Pet
    pets: [Pet]
    user(id: ID!): User
    users: [User]
  }

  type User {
    id: ID!
    name: String
    pets: [Pet]
  }

  type Pet {
    id: ID!
    name: String
    owner: User
  }
`;

const resolvers = {
  Query: {
    pet: (...args) => resolver(models.Pet)(...args),
    pets: (...args) => resolver(models.Pet)(...args),
    user: (...args) => resolver(models.User)(...args),
    users: (...args) => resolver(models.User)(...args),
  },
  User: {
    pets: (...args) => resolver(models.User.Pets)(...args),
  },
  Pet: {
    owner: (...args) => resolver(models.Pet.Owner)(...args),
  },
};

// Tell `graphql-sequelize` where to find the DataLoader context in the
// global request context
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context(req) {
    // For each request, create a DataLoader context for Sequelize to use
    const dataloaderContext = createContext(models.sequelize);

    // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
    // in the global request context
    resolver.contextToOptions = {
      dataloaderContext: [EXPECTED_OPTIONS_KEY]
    };

    return {
      dataloaderContext,
    };
  },
});

export default server;
