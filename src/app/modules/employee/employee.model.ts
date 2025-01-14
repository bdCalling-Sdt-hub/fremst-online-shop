import { Schema, model } from 'mongoose'
import { IEmployee, EmployeeModel } from './employee.interface'

const employeeSchema = new Schema<IEmployee, EmployeeModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    designation: { type: String, required: true },
    budget: { type: Number, required: true },
    duration: { type: Number, required: true },
    budgetExpiredAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
)

export const Employee = model<IEmployee, EmployeeModel>(
  'Employee',
  employeeSchema,
)
