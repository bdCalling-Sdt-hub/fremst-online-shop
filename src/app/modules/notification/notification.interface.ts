import { Model, Types } from 'mongoose';

export type INotification = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  isRead: boolean;
  user: Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationModel = Model<INotification>;
