import { Model, Types } from 'mongoose'

export type IEmployee = {
  _id: string
  user: Types.ObjectId
  company: Types.ObjectId
  designation: string
  totalOrders: number
  totalBudget: number
  totalSpentBudget: number
  budget: number
  budgetLeft: number
  duration: number
  budgetAssignedAt: Date
  budgetExpiredAt: Date
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type EmployeeModel = Model<IEmployee>

export type IEmployeeFilters = {
  searchTerm?: string
}
