import {Item, Organisation} from "./index"
import {SerialStatus} from "../enums"

export type Inventory = {
    id: string;
    itemId: string;
    item: Item;
    locationId: string;
    location: Location;
    quantity: number;
    reservedQuantity: number;
    organisation: Organisation;
    orgId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type SerialNumber = {
    id: string;
    serialNumber: string;
    itemId: string;
    item: Item;
    status: SerialStatus;
    locationId?: string;
    purchaseOrderId?: string;
    salesOrderId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };