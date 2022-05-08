import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { extendType, nonNull, objectType, stringArg } from "nexus";
import { appSecret } from "../utils/config-variables";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.field("user", {
      type: "User"
    });
    t.nonNull.string("token");
  }
});

export const SignupMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        name: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        const { email, password, name } = args;
        const encryptedPassword = await bcrypt.hash(password, 10);
        const newUser = await context.prisma.user.create({
          data: { email, password: encryptedPassword, name }
        });
        const token = jwt.sign({ userId: newUser.id }, appSecret);

        return {
          token,
          user: newUser
        };
      }
    });
  }
});

export const LoginMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        const { email, password } = args;
        const user = await context.prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error("User not found!");
        }

        const passwordIsCorrect = await bcrypt.compare(password, user.password);

        if (!passwordIsCorrect) {
          throw new Error("Incorrect email or password");
        }

        const token = jwt.sign({ userId: user.id }, appSecret);

        return {
          token,
          user
        };
      }
    });
  }
});
