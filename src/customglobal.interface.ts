export interface ICustomGlobal extends NodeJS.Global {
    __MONGO_URI__: string;
    __MONGO_DB_NAME__: string;
  }
