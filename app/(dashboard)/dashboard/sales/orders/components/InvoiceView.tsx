"use client";

import React, { useState, useRef, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Download, Printer, Mail, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sendSalesOrderEmail } from "@/actions/sales-orders";

interface InvoiceViewProps {
  salesOrder: any; // Replace with proper type
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
  };
  orgId: string;
}

export default function InvoiceView({
  salesOrder,
  companyInfo,
  orgId,
}: InvoiceViewProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const componentRef = React.useRef(null);

  // Format date
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "dd MMM yyyy");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Generate Invoice Number
  const invoiceNumber = `INV-${salesOrder.orderNumber.replace("SO-", "")}`;

  // Custom print function
  const customPrint = (iframe: HTMLIFrameElement | null) => {
    if (!iframe) {
      toast.error("Failed to prepare print document");
      return Promise.reject("No iframe provided");
    }

    return new Promise<void>((resolve) => {
      // Access the iframe document
      const iframeDoc = iframe.contentDocument;

      if (!iframeDoc) {
        toast.error("Failed to access print document");
        resolve();
        return;
      }

      // You can modify the iframe document here before printing
      // For example, add custom styles specific to printing
      const style = iframeDoc.createElement("style");
      style.textContent = `
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `;
      iframeDoc.head.appendChild(style);

      // Call the print function on the iframe window
      iframe.contentWindow?.print();

      // Resolve the promise after printing
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };
  // const invoiceRef = useRef(null);
  // Setup printing
  // const printFn = useReactToPrint({
  //   documentTitle: `Invoice-${salesOrder.orderNumber}`,
  //   print: customPrint,
  // });

  // Handle PDF Generation

  // const handleGeneratePDF = async () => {
  //   if (!componentRef.current) return;

  //   setIsGeneratingPdf(true);

  //   try {
  //     // Add a class to the element before generating the PDF
  //     // This allows us to add padding without affecting the normal display
  //     componentRef.current.classList.add("pdf-generation");

  //     const canvas = await html2canvas(componentRef.current, {
  //       scale: 2,
  //       logging: false,
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //       // Increase margins around content
  //       x: -20, // Negative value creates left padding
  //       y: -20, // Negative value creates top padding
  //       width: componentRef.current.offsetWidth + 40, // Add padding to width (left + right)
  //       height: componentRef.current.offsetHeight + 40, // Add padding to height (top + bottom)
  //     });

  //     // Remove the class after capturing
  //     componentRef.current.classList.remove("pdf-generation");

  //     const imgData = canvas.toDataURL("image/png");

  //     // A4 size: 210 x 297 mm
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     // Calculate dimensions with margins
  //     const pdfWidth = 210;
  //     const pdfHeight = 297;
  //     const margin = 15; // 15mm margins

  //     const contentWidth = pdfWidth - margin * 2;
  //     const contentHeight = (canvas.height * contentWidth) / canvas.width;

  //     // Add image with margins
  //     pdf.addImage(
  //       imgData,
  //       "PNG",
  //       margin, // X position (left margin)
  //       margin, // Y position (top margin)
  //       contentWidth, // Width with margins subtracted
  //       contentHeight // Proportional height
  //     );

  //     // If content is longer than one page, handle pagination
  //     if (contentHeight > pdfHeight - margin * 2) {
  //       let remainingHeight = contentHeight;
  //       let currentPage = 1;

  //       while (remainingHeight > pdfHeight - margin * 2) {
  //         // Add a new page
  //         pdf.addPage();
  //         currentPage++;

  //         // Calculate what portion to show on this page
  //         const pageContentHeight = pdfHeight - margin * 2;

  //         // On the new page, show the next portion of the image
  //         pdf.addImage(
  //           imgData,
  //           "PNG",
  //           margin, // X position
  //           margin - pageContentHeight * (currentPage - 1), // Y position (negative to move up)
  //           contentWidth, // Width
  //           contentHeight // Full height (PDF will clip as needed)
  //         );

  //         remainingHeight -= pageContentHeight;
  //       }
  //     }

  //     pdf.save(`Invoice-${salesOrder.orderNumber}.pdf`);

  //     toast.success("PDF generated successfully");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     toast.error("Failed to generate PDF");
  //   } finally {
  //     setIsGeneratingPdf(false);
  //   }
  // };
  // Refined PDF generation function with smaller padding and type fixes

  const handleGeneratePDF = async () => {
    if (!componentRef.current) return;

    setIsGeneratingPdf(true);

    try {
      // TypeScript fix: cast the ref to HTMLDivElement
      const element = componentRef.current as HTMLDivElement;

      // Add a class to the element before generating the PDF
      element.classList.add("pdf-generation");

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        // Reduced padding (from 20px to 10px)
        x: -10, // Smaller left padding
        y: -10, // Smaller top padding
        width: element.offsetWidth + 20, // Reduced horizontal padding (10px on each side)
        height: element.offsetHeight + 20, // Reduced vertical padding (10px on each side)
      });

      // Remove the class after capturing
      element.classList.remove("pdf-generation");

      const imgData = canvas.toDataURL("image/png");

      // A4 size: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calculate dimensions with smaller margins
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10; // Reduced from 15mm to 10mm margins

      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      // Add image with margins
      pdf.addImage(
        imgData,
        "PNG",
        margin, // X position (left margin)
        margin, // Y position (top margin)
        contentWidth, // Width with margins subtracted
        contentHeight // Proportional height
      );

      // If content is longer than one page, handle pagination
      if (contentHeight > pdfHeight - margin * 2) {
        let remainingHeight = contentHeight;
        let currentPage = 1;

        while (remainingHeight > pdfHeight - margin * 2) {
          // Add a new page
          pdf.addPage();
          currentPage++;

          // Calculate what portion to show on this page
          const pageContentHeight = pdfHeight - margin * 2;

          // On the new page, show the next portion of the image
          pdf.addImage(
            imgData,
            "PNG",
            margin, // X position
            margin - pageContentHeight * (currentPage - 1), // Y position (negative to move up)
            contentWidth, // Width
            contentHeight // Full height (PDF will clip as needed)
          );

          remainingHeight -= pageContentHeight;
        }
      }

      pdf.save(`Invoice-${salesOrder.orderNumber}.pdf`);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Send Invoice Email
  const handleSendEmail = async () => {
    if (!salesOrder.customer?.email) {
      toast.error("Customer has no email address");
      return;
    }

    try {
      setIsSending(true);
      // Prepare data in the format expected by the server action
      const emailData = {
        orderData: salesOrder,
        orderItems: salesOrder.lines,
        companyInfo: companyInfo,
      };

      // Call the server action to send the email
      const result = await sendSalesOrderEmail(
        emailData,
        salesOrder.customer.email
      );

      if (result.success) {
        toast.success(`Invoice sent to ${salesOrder.customer.email}`);
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An unexpected error occurred while sending the email");
    } finally {
      setIsSending(false);
    }
  };

  const handleAfterPrint = React.useCallback(() => {
    setIsPrinting(false);
    toast.success("Invoice printed successfully");
  }, []);

  const handleBeforePrint = React.useCallback(() => {
    setIsPrinting(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }, []);

  const printFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${salesOrder.orderNumber}`,
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
    print: customPrint,
  });

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleGeneratePDF}
          disabled={isGeneratingPdf}
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPdf ? "Generating..." : "Download PDF"}
        </Button>

        <Button
          variant="outline"
          onClick={() => printFn()}
          disabled={isPrinting}
        >
          <Printer className="h-4 w-4 mr-2" />
          {isPrinting ? "Printing..." : "Print"}
        </Button>

        {salesOrder.customer?.email && (
          <Button
            variant="outline"
            onClick={handleSendEmail}
            disabled={isSending}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        )}

        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="p-8 bg-white shadow-sm">
        <div ref={componentRef} className="p-2">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:items-start gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              {companyInfo.logo && (
                <img
                  src={companyInfo.logo}
                  alt={companyInfo.name}
                  className="h-16 w-16 object-contain"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {companyInfo.name}
                </h2>
                <p className="text-gray-500">{companyInfo.address}</p>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <h1 className="text-2xl font-bold text-gray-900 uppercase">
                INVOICE
              </h1>
              <p className="text-gray-700 font-medium mt-1">
                Invoice# {invoiceNumber}
              </p>
            </div>
          </div>

          <div className="h-0.5 bg-gray-200 my-6"></div>

          {/* Bill To / Ship To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
            <div>
              <p className="text-gray-500 uppercase text-sm font-medium mb-2">
                Bill To
              </p>
              <p className="font-medium text-gray-800">
                {salesOrder.customer?.name || "Walk-in Customer"}
              </p>
              {salesOrder.customer?.address && (
                <p className="text-gray-600">{salesOrder.customer.address}</p>
              )}
              {salesOrder.customer?.email && (
                <p className="text-gray-600">{salesOrder.customer.email}</p>
              )}
              {salesOrder.customer?.phone && (
                <p className="text-gray-600">{salesOrder.customer.phone}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 uppercase text-sm font-medium mb-2">
                Ship To
              </p>
              <p className="font-medium text-gray-800">
                {salesOrder.customer?.name || "Walk-in Customer"}
              </p>
              {salesOrder.customer?.address && (
                <p className="text-gray-600">{salesOrder.customer.address}</p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 p-3 rounded-md">
              <p className="text-sm text-gray-500 uppercase font-medium">
                Invoice Date
              </p>
              <p className="text-gray-800 font-medium">
                {formatDate(salesOrder.date)}
              </p>
            </div>

            <div className="border border-gray-200 p-3 rounded-md">
              <p className="text-sm text-gray-500 uppercase font-medium">
                Order Number
              </p>
              <p className="text-gray-800 font-medium">
                {salesOrder.orderNumber}
              </p>
            </div>

            <div className="border border-gray-200 p-3 rounded-md">
              <p className="text-sm text-gray-500 uppercase font-medium">
                Payment Status
              </p>
              <div className="mt-1">
                {salesOrder.paymentStatus === "PAID" ? (
                  <Badge variant="success">Paid</Badge>
                ) : salesOrder.paymentStatus === "PARTIAL" ? (
                  <Badge variant="warning">Partially Paid</Badge>
                ) : (
                  <Badge variant="outline">Unpaid</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 uppercase text-sm font-medium border-b border-gray-200">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 uppercase text-sm font-medium border-b border-gray-200">
                    Item & Description
                  </th>
                  <th className="text-center py-3 px-4 text-gray-500 uppercase text-sm font-medium border-b border-gray-200">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 text-gray-500 uppercase text-sm font-medium border-b border-gray-200">
                    Rate
                  </th>
                  <th className="text-right py-3 px-4 text-gray-500 uppercase text-sm font-medium border-b border-gray-200">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesOrder.lines.map((line: any, index: number) => (
                  <tr key={line.id} className="border-b border-gray-200">
                    <td className="py-4 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-800">
                        {line.item.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {line.item.sku && `SKU: ${line.item.sku}`}
                      </div>
                      {line.serialNumbers && line.serialNumbers.length > 0 && (
                        <div className="text-gray-500 text-sm">
                          Serial: {line.serialNumbers.join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700">
                      {line.quantity}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      {formatCurrency(line.unitPrice)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 font-medium">
                      {formatCurrency(line.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-3">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(salesOrder.subtotal)}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(salesOrder.taxAmount)}
                </span>
              </div>

              {salesOrder.shippingCost > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(salesOrder.shippingCost)}
                  </span>
                </div>
              )}

              {salesOrder.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-gray-800">
                    -{formatCurrency(salesOrder.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-xl text-gray-900">
                  {formatCurrency(salesOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {salesOrder.notes && (
            <div className="mt-2">
              <h3 className="text-gray-500 uppercase text-sm font-medium mb-2">
                Notes
              </h3>
              <p className="text-gray-600 border-t border-gray-200 pt-2">
                {salesOrder.notes}
              </p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="mt-6">
            <h3 className="text-gray-500 uppercase text-sm font-medium mb-2">
              Terms & Conditions
            </h3>
            <p className="text-gray-600 border-t border-gray-200 pt-2">
              Full payment is due upon receipt of this invoice. Late payments
              may incur additional charges or interest as per the applicable
              laws.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Thank you for your business.</p>
            <p className="mt-1">
              {companyInfo.email} | {companyInfo.phone}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
