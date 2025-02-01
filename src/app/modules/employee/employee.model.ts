import { Schema, model } from 'mongoose'
import { IEmployee, EmployeeModel } from './employee.interface'

const employeeSchema = new Schema<IEmployee, EmployeeModel>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    designation: { type: String, required: true },

    budget: { type: Number, required: true, default: 1000 },
    totalOrders: { type: Number, required: true, default: 0 },
    totalBudget: { type: Number, required: true, default: 1000 },
    totalSpentBudget: { type: Number, required: true, default: 0 },
    budgetLeft: { type: Number, required: true, default: 1000 },
    duration: { type: Number, required: true },
    budgetAssignedAt: { type: Date, required: true, default: Date.now },
    budgetExpiredAt: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
)

export const Employee = model<IEmployee, EmployeeModel>(
  'Employee',
  employeeSchema,
)
