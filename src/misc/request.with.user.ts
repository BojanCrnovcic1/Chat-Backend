import { User } from "src/entities/user";


declare module 'express' {
    interface Request {
        user?: User
    }
}