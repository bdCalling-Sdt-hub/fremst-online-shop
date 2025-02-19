import { Order } from "./order.model";

export const generateOrderId = async (): Promise<string> => {
  const lastOrder = await Order.findOne({}, {}, { sort: { 'createdAt': -1 } });
  let lastId = lastOrder?.orderId || '00000';

  const numericPart = parseInt(lastId.slice(-5));
  const newNumericPart = numericPart + 1;

  const paddedNumericPart = newNumericPart.toString().padStart(5, '0');
  const prefix = lastId.slice(0, -5);

  if (newNumericPart > 99999) {
    return (parseInt(prefix) + 1).toString() + '00001';
  }

  return prefix + paddedNumericPart;
};

