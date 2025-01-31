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


  export const OtherController = {
    createOrUpdateOthers,
    getOthers  
  }