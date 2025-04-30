"use client";

import { createBrand } from "@/actions/brands";
import { createCategory } from "@/actions/categories";
import { createItem } from "@/actions/items";
import { createUnit } from "@/actions/units";
import TextArea from "@/components/FormInputs/TextAreaInput";

import TextInput from "@/components/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateSlug } from "@/lib/generateSlug";
import { ItemCreateDTO } from "@/types/item";

import {
  Check,
  LayoutGrid,
  Loader2,
  Plus,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ItemFormModal({ orgId }: { orgId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemCreateDTO>();
  const [loading, setLoading] = useState(false);

  const saveUnit = async (data: ItemCreateDTO) => {
    setLoading(true);
    data.sellingPrice = Number(data.sellingPrice);
    data.costPrice = Number(data.costPrice);
    data.thumbnail =
      "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylkF1PXSCqAuseUG0gx8mhd";
    data.orgId = orgId;
    console.log(data);
    try {
      const res = await createItem(data);
      console.log(res);
      if (res.success) {
        setLoading(false);
        toast.error(res.error);
        return;
      }
      setLoading(false);
      toast.success("Item Created Successfully");
      // window.location.reload();
      reset();
    } catch (error) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Item
          </span>
          <span className="md:sr-only">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <Card className="w-full ">
          <CardHeader>
            <CardTitle>Create New Item</CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <form
              onSubmit={handleSubmit(saveUnit)}
              className="flex flex-col w-full gap-2"
            >
              <TextInput
                register={register}
                errors={errors}
                label="Item name"
                name="name"
              />
              <TextInput
                register={register}
                errors={errors}
                label="Item SKU"
                name="sku"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Selling Price"
                  name="sellingPrice"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Cost Price"
                  name="costPrice"
                />
              </div>

              {loading ? (
                <Button disabled>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Please wait...
                </Button>
              ) : (
                <Button>
                  <Check className="mr-2 h-4 w-4" /> Create Item
                </Button>
              )}
            </form>
          </CardFooter>
        </Card>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
