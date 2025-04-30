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
import { Customer } from "@prisma/client";
import { updateCustomerById } from "@/actions/customers";

export function BasicInfoTab({ customer }: { customer: Customer }) {
  return (
    <div className="grid gap-6 mt-6">
      <NameContactCard customer={customer} />
      <EmailPhone customer={customer} />
      <AddressTax customer={customer} />
      <NotesPaymentCard customer={customer} />
    </div>
  );
}

function NameContactCard({ customer }: { customer: Customer }) {
  const [name, setName] = useState(customer.name);
  const [address, setAddress] = useState(customer.address);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = { name, address };
      await updateCustomerById(customer.id, data);
      toast.success("Name and Address updated successfully");
    } catch (error) {
      toast.error("Failed to update name and address");
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
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="contactPerson">Customer Address</Label>
          <Input
            id="address"
            value={address ?? ""}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="customer address"
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

function EmailPhone({ customer }: { customer: Customer }) {
  const [email, setEmail] = useState(customer.email || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!email.trim() || !phone.trim()) {
      toast.error("You cannot submit empty fields");
      return;
    }
    setIsUpdating(true);

    try {
      const data = { email: email || undefined, phone: phone || undefined };
      await updateCustomerById(customer.id, data);
      toast.success("Email and Phone updated successfully");
    } catch (error) {
      toast.error("Failed to update Phone and email");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Identifiers</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Customer Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@gmail.com"
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

function NotesPaymentCard({ customer }: { customer: Customer }) {
  const [notes, setNotes] = useState(customer.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const data = {
        notes: notes || undefined,
      };
      await updateCustomerById(customer.id, data);
      toast.success("Notes updated successfully");
    } catch (error) {
      toast.error("Failed to update notes ");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Notes</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="description">Notes</Label>
          <Textarea
            id="description"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Customer notes"
            rows={3}
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

function AddressTax({ customer }: { customer: Customer }) {
  const [taxId, setTaxId] = useState(customer.taxId || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        taxId: taxId || undefined,
      };
      await updateCustomerById(customer.id, data);
      toast.success("TaxId updated successfully");
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
        <CardTitle>Customer Tax ID</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
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
          {isUpdating ? "Updating..." : "Update Tax "}
        </Button>
      </CardFooter>
    </Card>
  );
}
