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
import { ProductData } from "@/types/item";
import { updateItemById } from "@/actions/items";
import ImageUploadButton from "@/components/FormInputs/ImageUploadButton";
import { Option } from "../item-update-form";
import FormSelectInput from "@/components/FormInputs/FormSelectInput";
import MultipleImageInput from "@/components/FormInputs/MultipleImageInput";

// This would be a server action in a real application
async function updateItem(id: string, data: Partial<ProductData>) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Updating item:", id, data);
  return { success: true };
}

export function BasicInfoTab({
  item,
  brandOptions,
  categoryOptions,
}: {
  item: ProductData;
  categoryOptions: Option[];
  brandOptions: Option[];
}) {
  return (
    <div className="grid gap-6 mt-6">
      <NameSlugCard item={item} />
      <SkuBarcodeCard item={item} />
      <DescriptionDimensionsCard item={item} />
      <WeightThumbnailCard item={item} />
      <CategoryBrandCard
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        item={item}
      />
      <ImagesCard item={item} />
    </div>
  );
}

function NameSlugCard({ item }: { item: ProductData }) {
  const [name, setName] = useState(item.name);
  const [slug, setSlug] = useState(item.slug);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = { name, slug };
      await updateItemById(item.id, data);
      toast.success("Name and slug updated successfully");
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
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="product-slug"
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

function SkuBarcodeCard({ item }: { item: ProductData }) {
  const [sku, setSku] = useState(item.sku);
  const [barcode, setBarcode] = useState(item.barcode || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    setIsUpdating(true);

    try {
      const data = { sku, barcode: barcode || undefined };
      await updateItemById(item.id, data);
      toast.success("SKU and barcode updated successfully");
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
        <CardTitle>Product Identifiers</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU123456"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="barcode">Barcode</Label>
          <Input
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="123456789012"
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

function DescriptionDimensionsCard({ item }: { item: ProductData }) {
  const [description, setDescription] = useState(item.description || "");
  const [dimensions, setDimensions] = useState(item.dimensions || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        description: description || undefined,
        dimensions: dimensions || undefined,
      };
      await updateItemById(item.id, data);
      toast.success("Description and dimensions updated successfully");
    } catch (error) {
      toast.error("Failed to update description and dimensions");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Description</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
            rows={3}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="10x20x30 cm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Description"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function WeightThumbnailCard({ item }: { item: ProductData }) {
  const [weight, setWeight] = useState(item.weight?.toString() || "");
  const [thumbnail, setThumbnail] = useState(item.thumbnail || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        weight: weight ? Number.parseFloat(weight) : undefined,
        thumbnail: thumbnail || undefined,
      };
      await updateItemById(item.id, data);
      toast.success("Weight and thumbnail updated successfully");
    } catch (error) {
      toast.error("Failed to update weight and thumbnail");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight & Thumbnail</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="weight">Weight</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="1.5"
          />
        </div>
        <div className="grid gap-3 lg:w-1/3">
          <ImageUploadButton
            display="horizontal"
            title="Item image"
            imageUrl={thumbnail}
            setImageUrl={setThumbnail}
            endpoint="itemImage"
            size="lg"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Weight & Thumbnail"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CategoryBrandCard({
  item,
  brandOptions,
  categoryOptions,
}: {
  item: ProductData;
  categoryOptions: Option[];
  brandOptions: Option[];
}) {
  const [categoryId, setCategoryId] = useState(item.categoryId || "");

  const initialCategory = categoryOptions.find(
    (item) => item.value === categoryId
  );
  const [selectedCategory, setSelectedCategory] = useState<Option | undefined>(
    initialCategory
  );
  const [brandId, setBrandId] = useState(item.brandId || "");
  const initialBrand = brandOptions.find((item) => item.value === brandId);
  const [selectedBrand, setSelectedBrand] = useState<Option | undefined>(
    initialBrand
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const data = {
        categoryId: selectedCategory?.value || undefined,
        brandId: selectedBrand?.value || undefined,
      };
      await updateItemById(item.id, data);
      toast.success("Category and brand updated successfully");
    } catch (error) {
      toast.error("Failed to update category and brand");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category & Brand</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <FormSelectInput
            label="Categories"
            options={categoryOptions}
            option={selectedCategory as Option}
            setOption={setSelectedCategory}
            toolTipText="Add New Category"
            href="/dashboard/inventory/categories"
          />
          {/* In a real app, this would be a select dropdown with categories */}
        </div>
        <div className="grid gap-3">
          <FormSelectInput
            label="Brands"
            options={brandOptions}
            option={selectedBrand as Option}
            setOption={setSelectedBrand}
            toolTipText="Add New Brand"
            href="/dashboard/inventory/brands"
          />
          {/* In a real app, this would be a select dropdown with brands */}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Category & Brand"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ImagesCard({ item }: { item: ProductData }) {
  const defaultImages =
    item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls
      : [
          "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylkF1PXSCqAuseUG0gx8mhd",
          "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylkF1PXSCqAuseUG0gx8mhd",
          "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylkF1PXSCqAuseUG0gx8mhd",
          "https://14j7oh8kso.ufs.sh/f/HLxTbDBCDLwfAXaapcezIN7vwylkF1PXSCqAuseUG0gx8mhd",
        ];
  const [imageUrls, setImageUrls] = useState<string[]>(defaultImages);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      await updateItemById(item.id, { imageUrls });
      toast.success("Images updated successfully");
    } catch (error) {
      toast.error("Failed to update images");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <MultipleImageInput
            title="Product Images"
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            endpoint="itemImages"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Images"}
        </Button>
      </CardFooter>
    </Card>
  );
}
