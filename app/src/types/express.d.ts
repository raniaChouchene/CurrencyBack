 
 
import "express";
import { IUser } from "~/domain/entities/User/IUser";

declare global {
  namespace Express {
    interface User extends IUser {}
  }

}
