
import { verify } from "jsonwebtoken";
import { UserContext } from "./user-context.interface";
export function getContext(token: string) {
  const Authorization = token;
  if (Authorization) {
    token = Authorization.replace("Bearer ", "");
    try {
      const payload = verify(token, process.env.APP_SECRET) as UserContext;
      return payload;
    } catch (err) {
      return null;
    }
  }

  return null;
}
