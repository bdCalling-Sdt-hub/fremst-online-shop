import { JwtPayload } from 'jsonwebtoken';
import {  IEmployee } from './employee.interface';
import { Employee } from './employee.model';
import { User } from '../user/user.model';


const getEmployeeProfileFromDB = async (user: JwtPayload): Promise<IEmployee | null> => {
    const employee = await Employee.findById(user.userId).populate({
      path: 'company',
      select: {
        name: 1,
        address: 1,
        phone: 1,
        email: 1,
      },
    }).populate({
      path: 'user', 
      select: {
        name: 1,
        email: 1,
        address: 1,
        contact: 1,
        status: 1,
        role: 1,
      },
    }).lean()

    return employee
}


export const EmployeeServices = { getEmployeeProfileFromDB };
