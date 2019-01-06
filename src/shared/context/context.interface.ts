import { UserContext } from "./user-context.interface";

export interface IContext {
  readonly user?: UserContext;
}
