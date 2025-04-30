import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Link,
} from "@react-email/components";

// Types based on your provided data structure
export type SalesOrderEmailProps = {
  orderData: {
    id: string;
    orderNumber: string;
    date: Date;
    customerId: string | null;
    customer: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
    } | null;
    status:
      | "DRAFT"
      | "CONFIRMED"
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "COMPLETED"
      | "CANCELLED"
      | "RETURNED";
    paymentStatus: "PENDING" | "PARTIAL" | "PAID" | "REFUNDED";
    paymentMethod: string | null;
    subtotal: number;
    taxAmount: number;
    shippingCost?: number | null;
    discount?: number | null;
    total: number;
    notes?: string | null;
    createdBy: {
      name: string | null;
    };
    createdAt: Date;
    location: {
      id: string;
      name: string;
    };
  };
  orderItems: Array<{
    id: string;
    itemId: string;
    item: {
      id: string;
      name: string;
      sku: string;
    };
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    discount?: number | null;
    total: number;
    serialNumbers?: string[];
  }>;
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
};

export default function SalesOrderEmail({
  data,
}: {
  data: SalesOrderEmailProps;
}) {
  const { companyInfo, orderItems, orderData } = data;
  const currentYear = new Date().getFullYear();
  const formattedDate = orderData.date
    ? new Date(orderData.date).toLocaleDateString()
    : "";

  // Get status display info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
      CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700" },
      PROCESSING: {
        label: "Processing",
        color: "bg-yellow-50 text-yellow-700",
      },
      SHIPPED: { label: "Shipped", color: "bg-indigo-50 text-indigo-700" },
      DELIVERED: { label: "Delivered", color: "bg-purple-50 text-purple-700" },
      COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700" },
      CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700" },
      RETURNED: { label: "Returned", color: "bg-orange-50 text-orange-700" },
    };

    return (
      statusMap[status] || { label: status, color: "bg-gray-50 text-gray-700" }
    );
  };

  // Get payment status display info
  const getPaymentStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Pending", color: "bg-yellow-50 text-yellow-700" },
      PARTIAL: { label: "Partial", color: "bg-blue-50 text-blue-700" },
      PAID: { label: "Paid", color: "bg-green-50 text-green-700" },
      REFUNDED: { label: "Refunded", color: "bg-purple-50 text-purple-700" },
    };

    return (
      statusMap[status] || { label: status, color: "bg-gray-50 text-gray-700" }
    );
  };

  const statusInfo = getStatusInfo(orderData.status);
  const paymentStatusInfo = getPaymentStatusInfo(orderData.paymentStatus);

  // Create a mailto link for payment button
  const mailtoLink = `mailto:${companyInfo.email}?subject=Payment: ${orderData.orderNumber}&body=I am sending payment for order ${orderData.orderNumber}.`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>
          Order {orderData.orderNumber} from {companyInfo.name}
        </Preview>
        <Body className="bg-gray-50 font-sans py-6">
          <Container className="border border-gray-200 rounded-lg mx-auto p-0 max-w-[600px] overflow-hidden shadow-sm">
            {/* Header with Logo */}
            <Section className="bg-blue-700 px-6 py-4">
              <Row>
                <Column>
                  <Text className="text-white font-bold text-xl m-0">
                    {companyInfo.name}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-white text-sm m-0">
                    Sales Order / Invoice
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Order Information */}
            <Section className="bg-white px-6 pt-6 pb-2">
              <Row>
                <Column>
                  <Heading className="text-2xl font-bold text-gray-800 m-0">
                    Order:{" "}
                    <span className="text-blue-700">
                      {orderData.orderNumber}
                    </span>
                  </Heading>
                  <Text className="text-gray-500 mt-1">
                    Date: {formattedDate}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-sm text-gray-500 m-0">Status:</Text>
                  <Text
                    className={`text-sm font-medium ${statusInfo.color} px-2 py-1 rounded inline-block mr-1`}
                  >
                    {statusInfo.label}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${paymentStatusInfo.color} px-2 py-1 rounded inline-block`}
                  >
                    {paymentStatusInfo.label}
                  </Text>
                </Column>
              </Row>
              <Hr className="border-gray-200 my-4" />
            </Section>

            {/* Customer Info */}
            <Section className="bg-white px-6 py-2">
              <Text className="text-gray-800 font-medium">
                Customer: {orderData.customer?.name || "Walk-in Customer"}
              </Text>
              {orderData.customer?.address && (
                <Text className="text-gray-700 text-sm">
                  {orderData.customer.address}
                </Text>
              )}
              {(orderData.customer?.email || orderData.customer?.phone) && (
                <Text className="text-gray-700 text-sm">
                  {orderData.customer.email && (
                    <span>{orderData.customer.email}</span>
                  )}
                  {orderData.customer.email && orderData.customer.phone && (
                    <span> • </span>
                  )}
                  {orderData.customer.phone && (
                    <span>{orderData.customer.phone}</span>
                  )}
                </Text>
              )}
              <Hr className="border-gray-200 my-4" />
            </Section>

            {/* Order Details Table */}
            <Section className="bg-white px-6 py-4">
              <Heading className="text-lg font-bold text-blue-700 mb-3">
                Order Items
              </Heading>

              <Section className="border border-gray-200 rounded-md overflow-hidden">
                <Row className="bg-blue-50">
                  <Column className="p-3 border-r border-gray-200 font-bold text-gray-700">
                    Item
                  </Column>
                  <Column className="p-3 border-r border-gray-200 font-bold text-gray-700 text-center">
                    Qty
                  </Column>
                  <Column className="p-3 border-r border-gray-200 font-bold text-gray-700 text-right">
                    Unit Price
                  </Column>
                  <Column className="p-3 font-bold text-gray-700 text-right">
                    Total
                  </Column>
                </Row>

                {orderItems.map((item) => (
                  <Row key={item.id}>
                    <Column className="p-3 border-r border-t border-gray-200">
                      <Text className="font-medium text-gray-800 m-0">
                        {item.item.name}
                      </Text>
                      <Text className="text-xs text-gray-500 m-0">
                        SKU: {item.item.sku}
                      </Text>
                      {item.serialNumbers && item.serialNumbers.length > 0 && (
                        <Text className="text-xs text-gray-500 m-0">
                          S/N: {item.serialNumbers.join(", ")}
                        </Text>
                      )}
                    </Column>
                    <Column className="p-3 border-r border-t border-gray-200 text-center align-middle">
                      {item.quantity}
                    </Column>
                    <Column className="p-3 border-r border-t border-gray-200 text-right align-middle">
                      ${item.unitPrice.toFixed(2)}
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right align-middle">
                      ${item.total.toFixed(2)}
                    </Column>
                  </Row>
                ))}

                <Row className="bg-gray-50">
                  <Column
                    className="p-3 border-t border-gray-200 text-right font-medium"
                    colSpan={3}
                  >
                    Subtotal:
                  </Column>
                  <Column className="p-3 border-t border-gray-200 text-right">
                    ${orderData.subtotal.toFixed(2)}
                  </Column>
                </Row>
                <Row className="bg-gray-50">
                  <Column
                    className="p-3 border-t border-gray-200 text-right font-medium"
                    colSpan={3}
                  >
                    Tax:
                  </Column>
                  <Column className="p-3 border-t border-gray-200 text-right">
                    ${orderData.taxAmount.toFixed(2)}
                  </Column>
                </Row>
                {orderData.shippingCost && orderData.shippingCost > 0 && (
                  <Row className="bg-gray-50">
                    <Column
                      className="p-3 border-t border-gray-200 text-right font-medium"
                      colSpan={3}
                    >
                      Shipping:
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right">
                      ${orderData.shippingCost.toFixed(2)}
                    </Column>
                  </Row>
                )}
                {orderData.discount && orderData.discount > 0 && (
                  <Row className="bg-gray-50">
                    <Column
                      className="p-3 border-t border-gray-200 text-right font-medium"
                      colSpan={3}
                    >
                      Discount:
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right">
                      -${orderData.discount.toFixed(2)}
                    </Column>
                  </Row>
                )}
                <Row className="bg-blue-50">
                  <Column
                    className="p-3 border-t border-gray-200 text-right font-bold"
                    colSpan={3}
                  >
                    Total:
                  </Column>
                  <Column className="p-3 border-t border-gray-200 text-right font-bold text-blue-700">
                    ${orderData.total.toFixed(2)}
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Payment Info */}
            <Section className="bg-white px-6 py-4">
              <Row>
                <Column>
                  <Section className="mb-4">
                    <Heading className="text-md font-bold text-blue-700 mb-2">
                      Payment Status
                    </Heading>
                    <Text className="text-gray-700 m-0">
                      <Text
                        className={`text-sm font-medium ${paymentStatusInfo.color} px-2 py-1 rounded inline-block`}
                      >
                        {paymentStatusInfo.label}
                      </Text>
                    </Text>
                  </Section>

                  {orderData.paymentMethod && (
                    <Section>
                      <Heading className="text-md font-bold text-blue-700 mb-2">
                        Payment Method
                      </Heading>
                      <Text className="text-gray-700 m-0">
                        {orderData.paymentMethod}
                      </Text>
                    </Section>
                  )}
                </Column>

                {orderData.notes && (
                  <Column>
                    <Section>
                      <Heading className="text-md font-bold text-blue-700 mb-2">
                        Notes
                      </Heading>
                      <Text className="text-gray-700 m-0">
                        {orderData.notes}
                      </Text>
                    </Section>
                  </Column>
                )}
              </Row>
            </Section>

            {/* Call to Action */}
            <Section className="bg-white px-6 py-4 text-center">
              {orderData.paymentStatus !== "PAID" && (
                <>
                  <Link
                    href={mailtoLink}
                    className="bg-blue-700 hover:bg-blue-800 rounded-md text-white py-3 px-6 font-medium no-underline text-center inline-block shadow-sm"
                  >
                    Make Payment
                  </Link>
                  <Text className="text-sm text-gray-500 mt-2">
                    Please contact us to arrange payment
                  </Text>
                </>
              )}
              {orderData.paymentStatus === "PAID" && (
                <Text className="text-green-600 font-medium">
                  Thank you for your payment!
                </Text>
              )}
            </Section>

            {/* Created By */}
            <Section className="bg-white px-6 py-4">
              <Text className="text-gray-700 m-0">
                Created by: {orderData.createdBy.name || "Admin"}
              </Text>
              <Text className="text-gray-700 m-0 text-sm">
                Created on: {new Date(orderData.createdAt).toLocaleDateString()}
              </Text>

              <Hr className="border-gray-200 my-4" />

              <Text className="text-gray-700">
                If you have any questions regarding this order, please contact
                us at{" "}
                <span className="text-blue-700 font-medium">
                  {companyInfo.email}
                </span>{" "}
                or call{" "}
                <span className="text-blue-700 font-medium">
                  {companyInfo.phone}
                </span>
                .
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Text className="text-gray-500 text-xs m-0 text-center">
                {companyInfo.name} | {companyInfo.address}
              </Text>
              <Text className="text-gray-500 text-xs m-0 text-center">
                © {currentYear} {companyInfo.name}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
