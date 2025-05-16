/* eslint-disable @typescript-eslint/no-explicit-any */
import { memoryMap } from "@/app/utils/endpointMap";
import { transport } from "@brainspore/hypernexus";
import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      citizenNonCitizen: string;
      postCode: string;
      city: string;
      passportIDNo: string;
      title: string;
      countryRegionCode: string;
      gender: string;
      dateOfBirth: string;
      lastName: string;
      middleName: string;
      firstName: string;
      location: string;
      position: string;
      department: string;
      phone: string;
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile?: Record<string, any> | null;
    };
    error?: string;
  }
}

const handler = NextAuth({
    providers: [
        AzureAD({
            clientId: process.env.AZURE_AD_CLIENT_ID!,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
            tenantId: process.env.AZURE_AD_TENANT_ID!,
        })
    ],
    session: {
        maxAge: 1 * 24 * 60 * 60,
    },
    callbacks: {
        async session({ session, token }) {
            session.user.profile = token.profile as Record<string, any> | null;
          if (token.error) session.error = token.error as string;
            return session
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token
                try {
                  const response = await transport.get(
                    memoryMap.get("userProfiles"),
                    {
                      $filter: `eMail eq '${profile?.email}' and eMail ne ''`,
                      company: process.env.BC_COMPANY_NAME
                    }
                  ) as Record<string, any> | null;
                  if (response && response.value && response.value.length) {
                    token.profile = response.value.at(0)
                  } else {
                    token.profile = null;
                  }
                } catch (error: any) {
                  console.error("Error fetching user profile:", error);
                  token.error = "Failed to fetch user profile. Please try again later.";
                }
            }

            return token
        },
    },
});

export { handler as GET, handler as POST };
