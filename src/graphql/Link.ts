import { UserInputError } from "apollo-server";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { NexusGenObjects } from "../generated/nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  }
});

const links: NexusGenObjects["Link"][] = [
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL"
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website"
  }
];

export const FeedQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve() {
        return links;
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
      resolve(_parent, args) {
        const { url, description } = args;
        const newLink = {
          id: links.length + 1,
          url,
          description
        };
        links.push(newLink);
        return newLink;
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
        url: stringArg(),
        description: stringArg()
      },
      resolve(_parent, args) {
        const { id, url, description } = args;
        const link = links.find((linkItem) => linkItem.id === id);

        if (!link) {
          throw new UserInputError("Link ID not found");
        }

        if (url) {
          link.url = url;
        }

        if (description) {
          link.description = description;
        }

        return link;
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
      resolve(_parent, args) {
        const { id } = args;
        const linkIndex = links.findIndex((linkItem) => linkItem.id === id);
        const link = links[linkIndex];

        if (!link) {
          throw new UserInputError("Link ID not found");
        }

        links.splice(linkIndex, 1);

        return link;
      }
    });
  }
});
