import { ApolloServer } from "apollo-server";
import { connect } from "mongoose";
import { buildSchema } from "type-graphql";
import "reflect-metadata";

import { IContext } from "./shared/context/context.interface";
import { authChecker } from "./shared/context/auth-checker";
import { resolvers } from "./resolvers";
import { getContext } from "./shared/context/get-context.function";
import { ICustomGlobal } from "./customglobal.interface";

interface IMainOptions {
  env: string;
  port: number;
  verbose?: boolean;
}

/* istanbul ignore next: no need to test verbose print */
function verbosePrint(url) {
  console.log(`GraphQL Server is now running on ${url}`);
}

export async function main(options: IMainOptions) {
  try {
    const db_url = {
      production: process.env.MONGODB_URL,
      test: (global as ICustomGlobal).__MONGO_URI__,
    }[process.env.NODE_ENV] || process.env.LOCAL_MONGODB_URL;
    await connect(db_url, { useNewUrlParser: true });
    const schema = await buildSchema({
      resolvers,
      authChecker,
    });
    const apolloServer = new ApolloServer({
      context: ({ req }) => {
        const ctx: IContext = {
          user: getContext(req.get("Authorization")),
        };
        return ctx;
      },
      schema,
    });
    return new Promise((resolve, reject) => {
      apolloServer.listen().then((url) => {
        /* istanbul ignore if: no need to test verbose print */
        if (options.verbose) {
          verbosePrint(url.url);
        }

        resolve(apolloServer);
      }).catch((err: Error) => {
        reject(err);
      });
    });
  } catch (error) {
    console.log(error);
  }

}

/* istanbul ignore if: main scope */
if (require.main === module) {
  const PORT = parseInt(process.env.PORT || "4000", 10);

  const NODE_ENV = process.env.NODE_ENV;

  main({
    env: NODE_ENV,
    port: PORT,
    verbose: true,
  });
}
