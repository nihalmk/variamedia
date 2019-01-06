import { AuthChecker } from "type-graphql";
import { IContext } from "./context.interface";
import { Role } from "../../user/role.enum";

export const authChecker: AuthChecker<IContext, Role> =
  ({ context: { user } }, roles) => {

    if (roles.length === 0) {
      return user !== undefined;
    }

    if (!user) {
      // and if no user, restrict access
      return false;
    }

    if (roles.includes(user.role)) {
      return true;
    }

    return false; // or false if access denied
};
