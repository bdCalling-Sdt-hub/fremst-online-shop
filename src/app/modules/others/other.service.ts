import { StatusCodes } from "http-status-codes"
import { IOthers } from "./other.interface"
import { Other } from "./other.model"
import ApiError from "../../../errors/ApiError"


const createOrUpdateOthers = async (payload: Partial<IOthers>) => {
    const other = await Other.findOne({type: payload.type})
   try{
       if(!other){
           const newOther = await Other.create(payload)
       }else{
           const   newOther = await Other.findOneAndUpdate({type: payload.type},payload)
       }

    }catch(error){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Something went wrong, please try again')
    }

    return `${payload.type} updated successfully`
}


const getOthers = async (type: string) => {
    const other = await Other.findOne({type})
    if(!other){
        throw new ApiError(StatusCodes.NOT_FOUND, `${type} not found`)
    }
    return other
}




export const OtherServices = {
    createOrUpdateOthers,
    getOthers
}