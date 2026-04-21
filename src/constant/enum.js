export const ROLE = {
  STAFF: 1,
  ADMIN: 2,
};

export const TABLE_STATUS = {
  VACANT: "VACANT",
  OCCUPIED: "OCCUPIED",
  AVAILABLE: "VACANT",
};

export const SESSION_STATUS = {
  OPEN: "OPEN",
  PAID: "PAID",
  CLOSED: "CLOSED",
};

export const ORDER_STATUS = {
  NEW: "NEW",
  SENT_TO_KITCHEN: "SENT_TO_KITCHEN",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const FOOD_STATUS = {
  ORDERED: "ORDERED",
  PREPARING: "PREPARING",
  IN_PROGRESS: "IN_PROGRESS",
  SERVED: "SERVED",
  CANCELLED: "CANCELLED",
};

export const FOOD_STATUS_FLOW = {
  [FOOD_STATUS.PREPARING]: FOOD_STATUS.IN_PROGRESS,
  [FOOD_STATUS.IN_PROGRESS]: FOOD_STATUS.SERVED,
  [FOOD_STATUS.SERVED]: null,
};

export const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  TRANSFER: "TRANSFER",
  OTHER: "OTHER",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

// Backward-compatible aliases.
export const TableStatus = TABLE_STATUS;
export const SessionStatus = SESSION_STATUS;
export const OrderStatus = ORDER_STATUS;
export const OrderItemStatus = FOOD_STATUS;
export const PaymentMethod = PAYMENT_METHOD;
export const PaymentStatus = PAYMENT_STATUS;
