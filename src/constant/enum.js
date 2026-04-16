// src/constants/enums.js
export const TableStatus = {
    VACANT: 'VACANT',
    OCCUPIED: 'OCCUPIED'
};

export const SessionStatus = {
    OPEN: 'OPEN',
    PAID: 'PAID',
    CLOSED: 'CLOSED'
};

export const OrderStatus = {
    NEW: 'NEW',
    SENT_TO_KITCHEN: 'SENT_TO_KITCHEN',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const OrderItemStatus = {
    ORDERED: 'ORDERED',
    PREPARING: 'PREPARING',
    IN_PROGRESS: 'IN_PROGRESS',
    SERVED: 'SERVED',
    CANCELLED: 'CANCELLED'
};

export const PaymentMethod = {
    CASH: 'CASH',
    CARD: 'CARD',
    TRANSFER: 'TRANSFER',
    OTHER: 'OTHER'
};

export const PaymentStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
};