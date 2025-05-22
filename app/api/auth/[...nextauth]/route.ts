/* eslint-disable @typescript-eslint/no-explicit-any */
import { memoryMap } from "@/app/utils/endpointMap";
import { transport } from "@brainspore/hypernexus";
import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

interface UserProfile {
  no: string;
  type: string;
  firstName: string;
  middleName: string;
  lastName: string;
  eMail: string;
  gender: string;
  title: string;
  dateOfBirth: string;
  countryRegionCode: string;
  city: string;
  postCode?: string;
  phoneNo?: string;
  passportIDNo?: string;
  citizenNonCitizen?: string;
  status?: string;
  activated?: boolean;
  [key: string]: any;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    needsProfileSetup?: boolean;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile?: UserProfile | null;
    };
  }

  interface JWT {
    accessToken?: string;
    profile?: UserProfile | null;
    error?: string;
    needsProfileSetup?: boolean;
  }
}

function isValidProfile(profile: any): profile is UserProfile {
  return (
    profile &&
    typeof profile.no === "string" &&
    typeof profile.type === "string" &&
    typeof profile.firstName === "string" &&
    typeof profile.lastName === "string" &&
    typeof profile.eMail === "string"
  );
}

const handler = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  session: {
    maxAge: 1 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }: any) {
      session.user.profile = token.profile ?? null;
      session.needsProfileSetup = token.needsProfileSetup ?? false;

      if (token.error) {
        session.error = token.error;
      }

      return session;
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;

        try {
          const response = (await transport.get(memoryMap.get("userProfiles"), {
            $filter: `eMail eq '${profile?.email}' and eMail ne ''`,
            company: process.env.BC_COMPANY_NAME,
          })) as Record<string, any>;

          const userProfile = response?.value?.at(0);
          token.profile = isValidProfile(userProfile) ? userProfile : null;

          if (!token.profile) {
            token.needsProfileSetup = true;
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          token.error = "Failed to fetch user profile. Please try again later.";
        }
      }

      return token;
    },
  },
} satisfies NextAuthOptions);

export const authOptions = handler.authOptions;
export { handler as GET, handler as POST };
