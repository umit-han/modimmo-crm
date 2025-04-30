"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { Supplier } from "@prisma/client";
import { updateSupplierById } from "@/actions/suppliers";

export function BasicInfoTab({ supplier }: { supplier: Supplier }) {
  return (
    <div className="grid gap-6 mt-6">
      <NameContactCard supplier={supplier} />
      <EmailPhone supplier={supplier} />
      <AddressTax supplier={supplier} />
      <NotesPaymentCard supplier={supplier} />
    </div>
  );
}

function NameContactCard({ supplier }: { supplier: Supplier }) {
  const [name, setName] = useState(supplier.name);
  const [contactPerson, setContactPerson] = useState(supplier.contactPerson);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = { name, contactPerson };
      await updateSupplierById(supplier.id, data);
      toast.success("Name and Contact Person updated successfully");
    } catch (error) {
      toast.error("Failed to update name and slug");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Details</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Supplier Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Supplier name"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={contactPerson ?? ""}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="contact person"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Basic Details"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmailPhone({ supplier }: { supplier: Supplier }) {
  const [email, setEmail] = useState(supplier.email || "");
  const [phone, setPhone] = useState(supplier.phone || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!email.trim() || !phone.trim()) {
      toast.error("You cannot submit empty fields");
      return;
    }
    setIsUpdating(true);

    try {
      const data = { email: email || undefined, phone: phone || undefined };
      await updateSupplierById(supplier.id, data);
      toast.success("Email and Phone updated successfully");
    } catch (error) {
      toast.error("Failed to update SKU and barcode");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Identifiers</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Supplier Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="supplier@gmail.com"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+25676206326"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Identifiers"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function NotesPaymentCard({ supplier }: { supplier: Supplier }) {
  const [notes, setNotes] = useState(supplier.notes || "");
  const [paymentTerms, setPaymentTerms] = useState(supplier.paymentTerms || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        notes: notes || undefined,
        paymentTerms: paymentTerms ? Number(paymentTerms) : undefined,
      };
      await updateSupplierById(supplier.id, data);
      toast.success("Notes and payment terms updated successfully");
    } catch (error) {
      toast.error("Failed to update notes and payments");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Notes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          <Label htmlFor="description">Notes</Label>
          <Textarea
            id="description"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Supplier notes"
            rows={3}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="terms">Payment Terms</Label>
          <Input
            id="terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="30"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Notes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddressTax({ supplier }: { supplier: Supplier }) {
  const [address, setAddress] = useState(supplier.address || "");
  const [taxId, setTaxId] = useState(supplier.taxId || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        address: address || undefined,
        taxId: taxId || undefined,
      };
      await updateSupplierById(supplier.id, data);
      toast.success("Address and taxId updated successfully");
    } catch (error) {
      toast.error("Failed to update tax and address");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address & Tax</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-3">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Address"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="tax">Tax ID</Label>
          <Input
            id="tax"
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Enter Tax ID"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Tax & Address"}
        </Button>
      </CardFooter>
    </Card>
  );
}
