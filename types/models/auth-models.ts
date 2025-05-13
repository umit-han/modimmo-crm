import {
    Transfer,
    SalesOrder, 
    PurchaseOrder, 
    Adjustment, 
    GoodsReceipt,
    Inventory,
    Item,
    Category,
    Brand,
    Unit,
    TaxRate,
    Supplier,
    Customer
} from "./index"

export type Account = {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
    user: User;
  };
  
  export type Session = {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
    user: User;
  };
  
  export type Role = {
    id: string;
    displayName: string;
    roleName: string;
    organisation: Organisation;
    orgId: string;
    description?: string;
    permissions: string[];
    users: User[];
    userIds: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type User = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    emailVerified?: Date;
    image?: string;
    jobTitle?: string;
    roles: Role[];
    roleIds: string[];
    password?: string;
    status: boolean;
    accounts: Account[];
    sessions: Session[];
    orgName?: string;
    organisation: Organisation;
    orgId: string;
    location?: Location;
    locationId?: string;
    locationName?: string;
    isVerfied: boolean;
    token?: string;
    createdAt: Date;
    updatedAt: Date;
    roleId?: string;
    
    // Relationships for transactions
    createdPurchaseOrders: PurchaseOrder[];
    approvedPurchaseOrders: PurchaseOrder[];
    createdTransfers: Transfer[];
    approvedTransfers: Transfer[];
    createdSalesOrders: SalesOrder[];
    createdAdjustments: Adjustment[];
    approvedAdjustments: Adjustment[];
    receivedGoodsReceipts: GoodsReceipt[];
  };
  
  export type Organisation = {
    id: string;
    name: string;
    slug: string;
    industry?: string;
    country?: string;
    state?: string;
    address?: string;
    currency?: string;
    timezone?: string;
    inventoryStartDate?: Date;
    fiscalYear?: string;
    users: User[];
    invites: Invite[];
    roles: Role[];
    locations: Location[];
    inventory: Inventory[];
    items: Item[];
    categories: Category[];
    brands: Brand[];
    units: Unit[];
    taxRates: TaxRate[];
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    salesOrders: SalesOrder[];
    transfers: Transfer[];
    adjustments: Adjustment[];
    customers: Customer[];
    goodsReceipts: GoodsReceipt[];
    apiKeys: ApiKey[];
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Invite = {
    id: string;
    email: string;
    organisation: Organisation;
    orgId: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type ApiKey = {
    id: string;
    orgId: string;
    key: string;
    name: string;
    createdAt: Date;
    org: Organisation;
  };