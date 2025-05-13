import {
    Organisation,
    User,
    Item,
} from "./index"
import { AdjustmentStatus, AdjustmentType, TransferStatus } from '../enums';

export type Transfer = {
    id: string;
    transferNumber: string;
    date: Date;
    fromLocationId: string;
    fromLocation: Location;
    toLocationId: string;
    toLocation: Location;
    status: TransferStatus;
    notes?: string;
    organisation: Organisation;
    orgId: string;
    createdById: string;
    createdBy: User;
    approvedById?: string;
    approvedBy?: User;
    lines: TransferLine[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type TransferLine = {
    id: string;
    transferId: string;
    transfer: Transfer;
    itemId: string;
    item: Item;
    quantity: number;
    notes?: string;
    serialNumbers: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Adjustment = {
    id: string;
    adjustmentNumber: string;
    date: Date;
    locationId: string;
    location: Location;
    adjustmentType: AdjustmentType;
    reason: string;
    notes?: string;
    status: AdjustmentStatus;
    organisation: Organisation;
    orgId: string;
    createdById: string;
    createdBy: User;
    approvedById?: string;
    approvedBy?: User;
    lines: AdjustmentLine[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type AdjustmentLine = {
    id: string;
    adjustmentId: string;
    adjustment: Adjustment;
    itemId: string;
    item: Item;
    beforeQuantity: number;
    afterQuantity: number;
    adjustedQuantity: number;
    notes?: string;
    serialNumbers: string[];
    createdAt: Date;
    updatedAt: Date;
  };