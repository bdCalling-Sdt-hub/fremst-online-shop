import { StatusCodes } from "http-status-codes"
import { IFaq, IOthers } from "./other.interface"
import { Faq, Other } from "./other.model"
import ApiError from "../../../errors/ApiError"


const createOrUpdateOthers = async (payload: Partial<IOthers>) => {
    const other = await Other.findOne({type: payload.type})
   try{
       if(!other){
          await Other.create(payload)
       }else{
           await Other.findOneAndUpdate({type: payload.type},payload)
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


const createFaq = async (payload: IFaq) => {
    const faq = await Faq.create(payload)
    if(!faq){
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create faq')
    }
    return faq
}

const updateFaq = async (id: string, payload: IFaq) => {
    const faq = await Faq.findByIdAndUpdate(id, payload, {new: true})
    if(!faq){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found')
    }
    return faq
}
const getFaqs = async () => {
    const faqs = await Faq.find({})
    console.log(faqs)
    return faqs || []
}

const removeFaq = async (id: string) => {
    const faq = await Faq.findById(id)
    if(!faq){
        throw new ApiError(StatusCodes.NOT_FOUND, 'Faq not found')
    }
    await faq.deleteOne()
    return `${faq.question} deleted successfully`
}



export const OtherServices = {
    createOrUpdateOthers,
    getOthers,
    createFaq,
    updateFaq,
    getFaqs,
    removeFaq
}