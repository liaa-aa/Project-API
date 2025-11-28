import { buildSchema } from 'graphql'

export const schema = buildSchema(`
    type Bencana {
        id: ID!
        title: String!
        description: String!
        location: String!
        type: String!
        date: String!
    }

    type RegisRelawan {
        id: ID!
        userId: ID!
        bencanaId: ID!
        status: String!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        getBencana: [Bencana!]!
        getBencanaById(id: ID!): Bencana

        myRegistrations: [RegisRelawan!]!
        bencanaRelawan(bencanaId: ID!): [RegisRelawan!]!
    }

    type Mutation {
        createBencana(
          title: String!,
          description: String!,
          location: String!,
          type: String!,
          date: String!
        ): Bencana

        updateBencana(
          id: ID!,
          title: String,
          description: String,
          location: String,
          type: String,
          date: String
        ): Bencana

        deleteBencana(id: ID!): Bencana

        joinBencana(bencanaId: ID!): RegisRelawan
        cancelJoinBencana(bencanaId: ID!): RegisRelawan
        updateRegistrationStatus(id: ID!, status: String!): RegisRelawan
    }
`)
