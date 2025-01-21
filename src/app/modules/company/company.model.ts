import { Schema, model } from 'mongoose'
import { ICompany, CompanyModel } from './company.interface'

const companySchema = new Schema<ICompany, CompanyModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalEmployees: { type: Number, required: true, default: 0 },
    totalOrders: { type: Number, required: true, default: 0 },
    totalBudget: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
)

export const Company = model<ICompany, CompanyModel>('Company', companySchema)
