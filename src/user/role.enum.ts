import { registerEnumType } from "type-graphql";

export enum Role {
    Admin = "ADMIN",
    Editor = "EDITOR",
    User = "USER",
}

registerEnumType(Role, {
    name: "Role",
    description: "All possible roles",
});
