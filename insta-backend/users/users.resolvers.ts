import client from "../client";
import { IResolvers } from "apollo-server-express";

// A map of functions which return data for the schema.
const query: IResolvers = {
    Query: {
        user: (_, {username}) => client.user.findUnique({ where: 
            { username }}
        )
    }
};

export default query;