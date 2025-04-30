// app/dashboard/customers/[id]/components/customer-contact-info.tsx
import { Mail, Phone, Map, FileText, Building } from "lucide-react";

interface CustomerContactInfoProps {
  customer: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    taxId?: string | null;
    notes?: string | null;
  };
}

export default function CustomerContactInfo({
  customer,
}: CustomerContactInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {customer.email && (
        <div className="flex items-start gap-2">
          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <a
              href={`mailto:${customer.email}`}
              className="text-primary hover:underline"
            >
              {customer.email}
            </a>
          </div>
        </div>
      )}

      {customer.phone && (
        <div className="flex items-start gap-2">
          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <a
              href={`tel:${customer.phone}`}
              className="text-primary hover:underline"
            >
              {customer.phone}
            </a>
          </div>
        </div>
      )}

      {customer.address && (
        <div className="flex items-start gap-2">
          <Map className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p>{customer.address}</p>
          </div>
        </div>
      )}

      {customer.taxId && (
        <div className="flex items-start gap-2">
          <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tax ID</p>
            <p>{customer.taxId}</p>
          </div>
        </div>
      )}

      {customer.notes && (
        <div className="flex items-start gap-2 md:col-span-2">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Notes</p>
            <p className="whitespace-pre-line">{customer.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
