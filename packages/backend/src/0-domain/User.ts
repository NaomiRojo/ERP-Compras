import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import type { UserInfo } from "./UserInfo";
import type { Verifiers } from "./Password";


export interface UserInfo {
  userName: string
}

@Entity()
export class User {
  public constructor(id: string, info: UserInfo, verifiers: Verifiers) {
    this.id = id;
    this.userName = info.userName;
    this.password = verifiers.password;
  }

  public destructor(): [ id: string, info: UserInfo, verifiers: Verifiers ] {
    return [
      this.id,
      {
        userName: this.userName
      },
      {
        password: this.password
      }
    ];
  }

  @PrimaryGeneratedColumn("uuid")
  public id: string

  @Column()
  public userName: string

  @Column()
  public password: string

}

export const userInfo = (u: User): UserInfo => u.destructor()[1];

export const verifiers = (u: User): Verifiers => u.destructor()[2];

export const clone = (u: User): User => new User(...u.destructor());

export const modifyUserInfo = (f: (info: UserInfo) => UserInfo) => (user: User): User => {
  const [id,info,verifiers] = user.destructor();
  return new User(id,f(info),verifiers);
};

export const modifyVerifier = (f: (verifiers: Verifiers) => Verifiers) => (user: User): User => {
  const [id,info,verifiers] = user.destructor();
  return new User(id,info,f(verifiers));
};

