"use server";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getOrgKey } from "@/actions/apiKeys";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Create a base axios instance without authentication
const baseApi = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a function that returns an authenticated API instance
export async function getAuthenticatedApi() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user.orgId ?? "";
  const apiKey = await getOrgKey(orgId);

  // Return a new instance with the API key
  return axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
  });
}

// Use this for unauthenticated requests
export { baseApi as api };

// Example of how to use the authenticated API in a server action
// export async function fetchProtectedData(endpoint: string, params = {}) {
//   try {
//     const authenticatedApi = await getAuthenticatedApi();
//     const response = await authenticatedApi.get(endpoint, { params });
//     return response.data;
//   } catch (error) {
//     console.error("API request failed:", error);
//     throw error;
//   }
// }
