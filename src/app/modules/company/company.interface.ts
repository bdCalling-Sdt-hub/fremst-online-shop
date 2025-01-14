import { Model, Types } from 'mongoose'

export type ICompany = {
  _id: Types.ObjectId
  user: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type CompanyModel = Model<ICompany>
