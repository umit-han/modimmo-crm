import {
    Organisation, 
    User, 
    Inventory, 
    Transfer, 
    PurchaseOrder,
    GoodsReceipt,
    Adjustment,
    SalesOrder} from "./index"
import { LocationType } from '../enums';

export type Location = {
    id: string;
    name: string;
    type: LocationType;
    address?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
    
    // Relationships
    users: User[];
    inventories: Inventory[];
    incomingTransfers: Transfer[];
    outgoingTransfers: Transfer[];
    purchaseOrders: PurchaseOrder[];
    salesOrders: SalesOrder[];
    goodsReceipts: GoodsReceipt[];
    adjustments: Adjustment[];
  };