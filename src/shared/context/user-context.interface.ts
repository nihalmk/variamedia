import { User } from "../../user/user.model";
import { Role } from "../../user/role.enum";

export class UserContext implements Partial<User> {
  public readonly _id: string;
  public readonly role: Role;
}
