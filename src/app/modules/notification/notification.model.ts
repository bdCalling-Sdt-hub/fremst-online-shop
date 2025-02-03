import { Schema, model } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface'; 
import { USER_ROLES } from '../../../enum/user';

const notificationSchema = new Schema<INotification, NotificationModel>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
  },
},{timestamps:true});

export const Notification = model<INotification, NotificationModel>('Notification', notificationSchema);
