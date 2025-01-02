import { IUser } from "~/domain/entities/User/IUser";
import { IUserCreateData } from "~/domain/entities/User/IUserCreateData";

export interface ICreateUserUseCase {
  create(data: IUserCreateData): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
}
