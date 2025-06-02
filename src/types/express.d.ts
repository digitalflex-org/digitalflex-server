import { User as OriginalUser } from "../models/user.model";

declare global {
    namespace Express {
        interface User extends OriginalUser {
            role?: string;
        }

        interface Request {
            user?: User;
        }
    }
  }