import "jest";
import "reflect-metadata";
import { signJWT } from "./sign-jwt.function";
import { UserContext } from "./context/user-context.interface";
import { Role } from "../user/role.enum";

import { sign } from "jsonwebtoken";
jest.mock("jsonwebtoken");

describe("signJWT", () => {
    test("should return token prefixed with 'Bearing '", () => {
        const uc: UserContext = {
            _id: "sample",
            role: Role.Admin,
        };
        (sign as jest.Mock).mockReturnValue("randomvalue");
        const result = signJWT(uc);
        const matches = /^Bearer \S+$/.test(result);
        expect(matches).toBe(true);
    });
});
