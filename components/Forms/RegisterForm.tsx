"use client";
import { Headset, Loader2, Lock, Mail, User, Warehouse } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { UserProps } from "@/types/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TextInput from "../FormInputs/TextInput";
import PasswordInput from "../FormInputs/PasswordInput";
import SubmitButton from "../FormInputs/SubmitButton";
import { createUser } from "@/actions/users";
import CustomCarousel from "../frontend/custom-carousel";

import FormSelectInput from "../FormInputs/FormSelectInput";
import countries from "@/coutries";
import { generateSlug } from "@/lib/generateSlug";
export type OrgData = {
  name: string;
  slug: string;
  country: string;
  currency: string | undefined;
  timezone: string | undefined;
};
export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const initialCountryCode = "UG";
  const initialCountry = countries.find(
    (item) => item.code === initialCountryCode
  );
  const [selectedCountry, setSelectedCountry] = useState<any>(initialCountry);
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<UserProps>();
  const router = useRouter();
  async function onSubmit(data: UserProps) {
    setLoading(true);
    data.name = `${data.firstName} ${data.lastName}`;
    data.image =
      "https://utfs.io/f/59b606d1-9148-4f50-ae1c-e9d02322e834-2558r.png";
    const country = countries.find(
      (country) => country.value === selectedCountry.value
    );
    const orgData: OrgData = {
      name: data.orgName,
      slug: generateSlug(data.orgName),
      country: `${country?.label}-${country?.code}`,
      currency: country?.value,
      timezone: country?.timezone,
    };
    try {
      const res = await createUser(data, orgData);
      if (res.status === 409) {
        setLoading(false);
        setEmailErr(res.error);
      } else if (res.status === 200) {
        setLoading(false);
        toast.success("Account Created successfully", {
          description: "Your account has been create, Pending Verification",
        });
        router.push(`/verify/${res.data?.id}?email=${res.data?.email}`);
      } else {
        setLoading(false);
        toast.error("Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error("Network Error:", error);
      toast.error("Its seems something is wrong, try again");
    }
  }
  return (
    <div className="w-full lg:grid h-screen lg:min-h-[600px] lg:grid-cols-2 relative ">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid  gap-6 mt-10 md:mt-0">
          <div className="grid gap-2 mt-10 md:mt-0">
            <h1 className="text-3xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Create your <span className="text-rose-600">Inventory Pro</span>{" "}
              Account today to get started
            </p>
          </div>
          <div className="">
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Organisation"
                  name="orgName"
                  icon={Warehouse}
                  placeholder="eg Desishub"
                />
                <FormSelectInput
                  label="Countries"
                  options={countries}
                  option={selectedCountry}
                  setOption={setSelectedCountry}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="First Name"
                  name="firstName"
                  icon={User}
                  placeholder="first Name"
                />
                <TextInput
                  register={register}
                  errors={errors}
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  placeholder="last Name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  register={register}
                  errors={errors}
                  label="Phone"
                  name="phone"
                  icon={Headset}
                  placeholder="phone"
                />
                <div className="">
                  <TextInput
                    type="email"
                    register={register}
                    errors={errors}
                    label="Email Address"
                    name="email"
                    icon={Mail}
                    placeholder="email"
                    isRequired={false}
                  />
                </div>
              </div>

              <PasswordInput
                register={register}
                errors={errors}
                label="Password"
                name="password"
                icon={Lock}
                placeholder="password"
                type="password"
              />
              <div className="">
                {emailErr && (
                  <p className="text-red-500 text-xs mt-2">{emailErr}</p>
                )}
              </div>
              <div>
                <SubmitButton
                  title="Sign Up"
                  loadingTitle="Creating Please wait.."
                  loading={loading}
                  className="w-full"
                  loaderIcon={Loader2}
                  showIcon={false}
                />
              </div>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Already Registered ?{" "}
              <Link
                href="/login"
                className="font-semibold leading-6 text-rose-600 hover:text-rose-500"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <CustomCarousel />
      </div>
    </div>
  );
}
