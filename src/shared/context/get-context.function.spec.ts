
import "jest";
import "reflect-metadata";
import { getContext } from "./get-context.function";
import { Role } from "../../user/role.enum";
import { signJWT } from "../sign-jwt.function";

describe("Get Context test", () => {
  beforeAll(() => {
    process.env.APP_SECRET = "some_random_secret_key";
  });
  it("get-context should return UserContext type", () => {
    const user_id = "user_id_random";
    const token1 = signJWT({ _id: user_id, role: Role.Admin });
    const result1 = getContext(token1);
    expect(result1.role).toBeDefined();
    expect(result1._id).toBe(user_id);

    const token2 = "wrong token";
    const result2 = getContext(token2);
    expect(result2).toBeNull();
  });
});
