import {
    Organisation,
    User,
    Item
} from "./index"
import {
    Source,
    SalesOrderStatus,
    PaymentStatus
} from "../enums"

export type Customer = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    notes?: string;
    isActive: boolean;
    organisation: Organisation;
    orgId: string;
    salesOrders: SalesOrder[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type SalesOrder = {
    id: string;
    orderNumber: string;
    date: Date;
    customerId?: string;
    source: Source;
    customer?: Customer;
    locationId: string;
    location: Location;
    status: SalesOrderStatus;
    subtotal: number;
    taxAmount: number;
    shippingCost?: number;
    discount?: number;
    total: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    notes?: string;
    organisation: Organisation;
    orgId: string;
    createdById: string;
    createdBy: User;
    lines: SalesOrderLine[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type SalesOrderLine = {
    id: string;
    salesOrderId: string;
    salesOrder: SalesOrder;
    itemId: string;
    item: Item;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discount?: number;
    total: number;
    serialNumbers: string[];
    createdAt: Date;
    updatedAt: Date;
  };