import "jest";
import "reflect-metadata";
import { IContext } from "./context.interface";
import { authChecker } from "./auth-checker";

import { Role } from "../../user/role.enum";

describe("authChecker", () => {

  it("should only permit users whose role is included in the annotated set of roles", () => {
    const roles = [Role.Admin, Role.User, Role.Editor];
    const mockuser1: IContext = {
      user: {
        _id: "id_mock",
        role: Role.Admin,
      },
    };
    const mockuser2: IContext = {
      user: {
        _id: "id_mock",
        role: Role.Editor,
      },
    };
    const mockuser3: IContext = {
      user: {
        _id: "id_mock",
        role: Role.User,
      },
    };
    const mockuser4 = {
      user: {
        _id: "id_mock",
      },
    };

    const result1 = authChecker({info: null, args: null, root: null, context: mockuser1}, roles);
    const result2 = authChecker({info: null, args: null, root: null, context: mockuser2}, roles);
    const result3 = authChecker({info: null, args: null, root: null, context: mockuser3}, roles);
    const result4 = authChecker({info: null, args: null, root: null, context: mockuser4 as IContext}, roles);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
    expect(result4).toBe(false);
  });
  it("should just check whether or not the user is authenticated if no roles are annotated", () => {
    const roles = [];
    const mockuser4: IContext = {
      user: {
        _id: "id_mock",
        role: Role.Admin,
      },
    };
    const result4 = authChecker({info: null, args: null, root: null, context: mockuser4}, roles);
    expect(result4).toBe(true);
  });
});
