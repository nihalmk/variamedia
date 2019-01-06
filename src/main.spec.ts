import "jest";
import { main } from "./main";
import { get as httpGet, Server, IncomingMessage } from "http";
import { ApolloServer } from "apollo-server";
import { connection, disconnect } from "mongoose";

const PORT: number = 4000;

function getFromServer(uri) {
  return new Promise((resolve, reject) => {
    httpGet(`http://localhost:${PORT}${uri}`, (res) => {
      resolve(res);
    }).on("error", (err: Error) => {
      reject(err);
    });
  });
}

describe("main", () => {
  it("should be able to initialize a server (development)", () => {
      // Before main() is called there is no active connection:

    expect(connection.readyState).toBe(0);
    return main({
      env: "dev",
      port: PORT,
    })
    .then(async (server: ApolloServer) => {
        // After main() got called, there is an active connection:
      expect(connection.readyState).toBe(1);
      return server.stop();
    });
  });
  it("should have a working GET graphql (developemnt)", () => {
    return main({
      env: "dev",
      port: PORT,
    }).then(async (server: ApolloServer) => {
      // After main() got called, there is an active connection:
      expect(connection.readyState).toBe(1);
      return getFromServer("").then( async (res: IncomingMessage) => {
        // GET without query returns 400
        expect(res.statusCode).toBe(400);
        return server.stop();
      });
    });
  });
  afterEach(async () => {
    await disconnect();
  });
});
