import { sign } from "jsonwebtoken";
import { UserContext } from "./context/user-context.interface";

/** Signs the JWT only accepting a JWTPayload and prefixes "Bearer " */
export function signJWT(payload: UserContext): string {
    return "Bearer " + sign(payload, process.env.APP_SECRET);
}
