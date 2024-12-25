import { Admin } from "src/entities/admin.entity";
import { User } from "src/entities/user.entity";


declare module 'express' {
    interface Request {
        user?: User;
        admin?: Admin;
    }
}