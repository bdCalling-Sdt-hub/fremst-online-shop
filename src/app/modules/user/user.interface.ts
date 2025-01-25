import { Model, Types } from 'mongoose'

type IAuthentication = {
  passwordChangedAt: Date;
  isResetPassword: boolean;
  oneTimeCode: number;
  expireAt: Date;
}

export type IUser = {
  _id: Types.ObjectId
  email: string
  name: string
  contact?: string
  address: string
  password: string
  profile?: string
  status: string
  role: string
  createdAt: Date
  updatedAt: Date
  authentication: IAuthentication
}

export type UserModel = {
  isPasswordMatched(password: string, hashPassword: string): Promise<boolean>
} & Model<IUser>
