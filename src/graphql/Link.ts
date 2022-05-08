import { UserInputError } from "apollo-server";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../generated/nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      }
    });
  }
});

export const FeedQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context) {
        return context.prisma.link.findMany();
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
        return context.prisma.link.create({
          data: {
            url,
            description
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
