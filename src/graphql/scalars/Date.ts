import { GraphQLDateTime } from "graphql-scalars";
import { asNexusMethod } from "nexus";

export const GQLDateTime = asNexusMethod(GraphQLDateTime, "dateTime");
