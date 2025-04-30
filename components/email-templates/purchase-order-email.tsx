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
export type PurchaseOrderEmailProps = {
  poData: {
    id: string;
    poNumber: string;
    date: Date;
    supplierId: string;
    supplierName?: string | null;
    supplier: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
    };
    status:
      | "DRAFT"
      | "SUBMITTED"
      | "APPROVED"
      | "PARTIALLY_RECEIVED"
      | "RECEIVED"
      | "CANCELLED"
      | "CLOSED";
    subtotal: number;
    taxAmount: number;
    shippingCost?: number | null;
    discount?: number | null;
    total: number;
    notes?: string | null;
    paymentTerms?: string | null;
    expectedDeliveryDate?: Date | null;
    createdBy: {
      name: string | null;
    };
    createdAt: Date;
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
    receivedQuantity: number;
  }>;
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
  };
};

export default function PurchaseOrderEmail({
  data,
}: {
  data: PurchaseOrderEmailProps;
}) {
  const { companyInfo, orderItems, poData } = data;
  const currentYear = new Date().getFullYear();
  const formattedDate = poData.date
    ? new Date(poData.date).toLocaleDateString()
    : "";
  const formattedDeliveryDate = poData.expectedDeliveryDate
    ? new Date(poData.expectedDeliveryDate).toLocaleDateString()
    : "Not specified";

  // Get status display info
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
      SUBMITTED: { label: "Submitted", color: "bg-blue-50 text-blue-700" },
      APPROVED: { label: "Approved", color: "bg-green-50 text-green-700" },
      PARTIALLY_RECEIVED: {
        label: "Partially Received",
        color: "bg-yellow-50 text-yellow-700",
      },
      RECEIVED: { label: "Received", color: "bg-green-50 text-green-700" },
      CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700" },
      CLOSED: { label: "Closed", color: "bg-gray-50 text-gray-700" },
    };

    return (
      statusMap[status] || { label: status, color: "bg-gray-50 text-gray-700" }
    );
  };

  const statusInfo = getStatusInfo(poData.status);

  // Create a mailto link for the confirm order button
  const mailtoLink = `mailto:${companyInfo.email}?subject=Confirmation: ${poData.poNumber}&body=I confirm receipt of purchase order ${poData.poNumber}.`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>
          Purchase Order {poData.poNumber} from {companyInfo.name}
        </Preview>
        <Body className="bg-gray-50 font-sans py-6">
          <Container className="border border-gray-200 rounded-lg mx-auto p-0 max-w-[600px] overflow-hidden shadow-sm">
            {/* Header with Logo */}
            <Section className="bg-red-700 px-6 py-4">
              <Row>
                <Column>
                  <Text className="text-white font-bold text-xl m-0">
                    {companyInfo.name}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-white text-sm m-0">Purchase Order</Text>
                </Column>
              </Row>
            </Section>

            {/* PO Information */}
            <Section className="bg-white px-6 pt-6 pb-2">
              <Row>
                <Column>
                  <Heading className="text-2xl font-bold text-gray-800 m-0">
                    PO: <span className="text-red-700">{poData.poNumber}</span>
                  </Heading>
                  <Text className="text-gray-500 mt-1">
                    Date: {formattedDate}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-sm text-gray-500 m-0">Status:</Text>
                  <Text
                    className={`text-sm font-medium ${statusInfo.color} px-2 py-1 rounded inline-block`}
                  >
                    {statusInfo.label}
                  </Text>
                </Column>
              </Row>
              <Hr className="border-gray-200 my-4" />
            </Section>

            {/* Supplier Info */}
            <Section className="bg-white px-6 py-2">
              <Text className="text-gray-800 font-medium">
                Supplier: {poData.supplier.name}
              </Text>
              {poData.supplier.address && (
                <Text className="text-gray-700 text-sm">
                  {poData.supplier.address}
                </Text>
              )}
              {(poData.supplier.email || poData.supplier.phone) && (
                <Text className="text-gray-700 text-sm">
                  {poData.supplier.email && (
                    <span>{poData.supplier.email}</span>
                  )}
                  {poData.supplier.email && poData.supplier.phone && (
                    <span> • </span>
                  )}
                  {poData.supplier.phone && (
                    <span>{poData.supplier.phone}</span>
                  )}
                </Text>
              )}
              <Hr className="border-gray-200 my-4" />
            </Section>

            {/* Order Details Table */}
            <Section className="bg-white px-6 py-4">
              <Heading className="text-lg font-bold text-red-700 mb-3">
                Order Items
              </Heading>

              <Section className="border border-gray-200 rounded-md overflow-hidden">
                <Row className="bg-red-50">
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
                    </Column>
                    <Column className="p-3 border-r border-t border-gray-200 text-center align-middle">
                      {item.quantity}
                    </Column>
                    <Column className="p-3 border-r border-t border-gray-200 text-right align-middle">
                      ${item.unitPrice.toFixed(2)}
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right align-middle">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
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
                    ${poData.subtotal.toFixed(2)}
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
                    ${poData.taxAmount.toFixed(2)}
                  </Column>
                </Row>
                {poData.shippingCost && poData.shippingCost > 0 && (
                  <Row className="bg-gray-50">
                    <Column
                      className="p-3 border-t border-gray-200 text-right font-medium"
                      colSpan={3}
                    >
                      Shipping:
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right">
                      ${poData.shippingCost.toFixed(2)}
                    </Column>
                  </Row>
                )}
                {poData.discount && poData.discount > 0 && (
                  <Row className="bg-gray-50">
                    <Column
                      className="p-3 border-t border-gray-200 text-right font-medium"
                      colSpan={3}
                    >
                      Discount:
                    </Column>
                    <Column className="p-3 border-t border-gray-200 text-right">
                      -${poData.discount.toFixed(2)}
                    </Column>
                  </Row>
                )}
                <Row className="bg-red-50">
                  <Column
                    className="p-3 border-t border-gray-200 text-right font-bold"
                    colSpan={3}
                  >
                    Total:
                  </Column>
                  <Column className="p-3 border-t border-gray-200 text-right font-bold text-red-700">
                    ${poData.total.toFixed(2)}
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Additional Info */}
            <Section className="bg-white px-6 py-4">
              <Row>
                <Column>
                  {poData.expectedDeliveryDate && (
                    <Section className="mb-4">
                      <Heading className="text-md font-bold text-red-700 mb-2">
                        Expected Delivery
                      </Heading>
                      <Text className="text-gray-700 m-0">
                        {formattedDeliveryDate}
                      </Text>
                    </Section>
                  )}

                  {poData.paymentTerms && (
                    <Section>
                      <Heading className="text-md font-bold text-red-700 mb-2">
                        Payment Terms
                      </Heading>
                      <Text className="text-gray-700 m-0">
                        {poData.paymentTerms}
                      </Text>
                    </Section>
                  )}
                </Column>

                {poData.notes && (
                  <Column>
                    <Section>
                      <Heading className="text-md font-bold text-red-700 mb-2">
                        Notes
                      </Heading>
                      <Text className="text-gray-700 m-0">{poData.notes}</Text>
                    </Section>
                  </Column>
                )}
              </Row>
            </Section>

            {/* Call to Action */}
            <Section className="bg-white px-6 py-4 text-center">
              <Link
                href={mailtoLink}
                className="bg-red-700 hover:bg-red-800 rounded-md text-white py-3 px-6 font-medium no-underline text-center inline-block shadow-sm"
              >
                Confirm This Order
              </Link>
              <Text className="text-sm text-gray-500 mt-2">
                Please reply to confirm this order
              </Text>
            </Section>

            {/* Created By */}
            <Section className="bg-white px-6 py-4">
              <Text className="text-gray-700 m-0">
                Created by: {poData.createdBy.name || "Admin"}
              </Text>
              <Text className="text-gray-700 m-0 text-sm">
                Created on: {new Date(poData.createdAt).toLocaleDateString()}
              </Text>

              <Hr className="border-gray-200 my-4" />

              <Text className="text-gray-700">
                If you have any questions regarding this purchase order, please
                contact us at{" "}
                <span className="text-red-700 font-medium">
                  {companyInfo.email}
                </span>{" "}
                or call{" "}
                <span className="text-red-700 font-medium">
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
