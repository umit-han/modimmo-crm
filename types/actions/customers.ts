export type SalesOrder = {
    status: string;
    total: number;
    paymentStatus: string;
    date: Date;
    location: any;
    lines: Array<{
      item: {
        id: string;
        name: string;
        sku: string;
      };
    }>;
    createdBy: {
      id: string;
      name: string;
    };
};

export type StatusCount = {
  status: string;
  _count: {
    status: number;
  };
};

export type PaymentStatusCount = {
  paymentStatus: string;
  _count: {
    paymentStatus: number;
  };
};
  