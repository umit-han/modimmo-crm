// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string;
      roles: Role[];
      permissions: string[];
      orgId: string;
      orgName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    permissions: string[];
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgId: string;
    orgName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    roles: Role[];
    orgId: string;
    orgName: string | null;
    permissions: string[];
  }
}
