import { Model, Types } from 'mongoose'

export type IEmployee = {
  _id: string
  user: Types.ObjectId
  designation: string
  budget: number
  duration: number
  budgetExpiredAt: Date
  createdAt: Date
  updatedAt: Date
}

export type EmployeeModel = Model<IEmployee>
