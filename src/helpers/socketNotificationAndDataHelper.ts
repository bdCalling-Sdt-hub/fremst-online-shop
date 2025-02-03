import { Types } from "mongoose"
import { Notification } from "../app/modules/notification/notification.model"
import ApiError from "../errors/ApiError"
import { StatusCodes } from "http-status-codes"

type INotification ={
    nameSpace: string
    recipient: string
    title: string
    description: string
    user?: Types.ObjectId
    type: string
}

const sendNotification = async(payload:INotification) => {
    const notification = await Notification.create(payload);
    if(!notification){
        throw new ApiError(StatusCodes.BAD_REQUEST,'Failed to send notification')
    }
    //@ts-ignore
    const socket = global.io;
    if(socket){
        socket.emit(`${payload.nameSpace}::${payload.recipient}`, notification)
    }
}


const sendDataWithSocket = (nameSpace: string, recipient:string, data:Record<string,any>) => {
    //@ts-ignore
    const socket = global.io;
    if(socket){
        socket.emit(`${nameSpace}::${recipient}`,data)
    }
}

export const socketDataAndNotificationHelper ={
    sendDataWithSocket,
    sendNotification
}