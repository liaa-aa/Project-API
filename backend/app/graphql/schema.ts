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

    type Query {
        getBencana: [Bencana!]!
        getBencanaById(id: ID!): Bencana
    }

    type Mutation {
        createBencana(title: String!, description: String!, location: String!, type: String!, date: String!): Bencana
        updateBencana(id: ID!, title: String, description: String, location: String, type: String, date: String): Bencana
        deleteBencana(id: ID!): Bencana
    }
`)
