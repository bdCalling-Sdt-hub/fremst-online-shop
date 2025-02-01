import { Model, Types } from 'mongoose'

type IAuthentication = {
  passwordChangedAt: Date;
  isResetPassword: boolean;
  oneTimeCode: number;
  expireAt: Date;
}
export type IAddress = {
  streetAddress: string
  city: string
  postalCode: string
}

export type IUser = {
  _id: Types.ObjectId
  email: string
  name: string
  contact?: string
  address: IAddress
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
