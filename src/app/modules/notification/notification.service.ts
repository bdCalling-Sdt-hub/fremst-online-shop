import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';
import { USER_ROLES } from '../../../enum/user';
const getAllNotification =async (user:JwtPayload) => {
    const query = user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUPER_ADMIN ? {type: 'admin'} : { user: user.authId };
    const notifications = await Notification.find(query) ;
    return notifications || [];
};

const getSingleNotification = async (id: string) => {
  const notification = await Notification.findById(id);
  await Notification.findByIdAndUpdate(id, { isRead: true });
  return notification;
};
export const NotificationServices = { getAllNotification, getSingleNotification };
