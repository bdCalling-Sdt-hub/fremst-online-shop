import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OtherServices } from "./other.service";
import { StatusCodes } from "http-status-codes";

const createOrUpdateOthers = catchAsync(async (req: Request, res: Response) => {
    const { content, type } = req.body;
    
    const result = await OtherServices.createOrUpdateOthers({ type, content });
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${type} created or updated successfully`,
      data: result,
    });
  });




  const getOthers = catchAsync(async (req: Request, res: Response) => {
    const type = req.params.type
    const result = await OtherServices.getOthers(type);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: `${type} retrieved successfully`,
      data: result,
    });
  })


  const createFaq = catchAsync(async (req: Request, res: Response) => {

    const result = await OtherServices.createFaq(req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Faq created successfully',
      data: result,
    });
  })

  const updateFaq = catchAsync(async (req: Request, res: Response) => {
    const { ...faqData } = req.body;
    const { id } = req.params;
    const result = await OtherServices.updateFaq(id, faqData);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Faq updated successfully',
      data: result,
    });
  })


  const getFaqs = catchAsync(async (req: Request, res: Response) => {
    const result = await OtherServices.getFaqs()
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Faqs retrieved successfully',
      data: result,
    });
  })

  const removeFaq = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;  
    const result = await OtherServices.removeFaq(id);
    sendResponse(res, { 
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Faq removed successfully',
      data: result,
    });
  })

  export const OtherController = {
    createOrUpdateOthers,
    getOthers,
    createFaq,
    updateFaq,
    getFaqs,
    removeFaq,
  }