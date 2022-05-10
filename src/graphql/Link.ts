import { Prisma } from "@prisma/client";
import { UserInputError } from "apollo-server";
import {
  arg,
  enumType,
  extendType,
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg
} from "nexus";
import { NexusGenObjects } from "../generated/nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      }
    });
    t.nonNull.list.field("votes", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .votes();
      }
    });
  }
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  }
});

export const Sort = enumType({ name: "Sort", members: ["asc", "desc"] });

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: "Link" });
    t.nonNull.int("count");
    t.id("id");
  }
});

export const FeedQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) })
      },
      async resolve(parent, args, context) {
        const { filter, skip, take, orderBy } = args;
        const where = filter
          ? {
              OR: [
                { description: { contains: filter } },
                { url: { contains: filter } }
              ]
            }
          : undefined;

        const links = await context.prisma.link.findMany({
          where,
          skip: skip as number | undefined,
          take: take as number | undefined,
          orderBy: orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined
        });

        const count = await context.prisma.link.count({ where });
        const id = `main-feed:${JSON.stringify(args)}`;

        return {
          links,
          count,
          id
        };
      }
    });
  }
});

export const PostMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        url: nonNull(stringArg()),
        description: nonNull(stringArg())
      },
      resolve(_parent, args, context) {
        const { url, description } = args;
        const { userId } = context;

        if (!userId) {
          throw new Error("Login is required");
        }

        return context.prisma.link.create({
          data: {
            url,
            description,
            postedBy: { connect: { id: userId } }
          }
        });
      }
    });
  }
});

export const UpdateMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        url: nonNull(stringArg()),
        description: nonNull(stringArg())
      },
      resolve(_parent, args, context) {
        const { id, url, description } = args;
        return context.prisma.link.update({
          where: { id },
          data: {
            url,
            description
          }
        });
      }
    });
  }
});

export const DeleteMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(intArg())
      },
      resolve(_parent, args, context) {
        const { id } = args;
        return context.prisma.link.delete({
          where: { id }
        });
      }
    });
  }
});
