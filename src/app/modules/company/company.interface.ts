import { Model, Types } from 'mongoose'

export type ICompany = {
  _id: Types.ObjectId
  user: Types.ObjectId
  createdBy: Types.ObjectId
  totalEmployees: number
  totalOrders: number
  totalBudget: number
  totalSpentBudget: number
  availableProducts: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export type CompanyModel = Model<ICompany>

export type ICompanyFilters = {
  searchTerm?: string

}
