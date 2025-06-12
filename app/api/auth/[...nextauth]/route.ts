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
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async session({ session, token }) {
      const profile = token.profile;

      session.user.profile = isValidProfile(profile) ? profile : null;
      session.needsProfileSetup = Boolean(token.needsProfileSetup);

      if (typeof token.error === "string") {
        session.error = token.error;
      }

      return session;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;

        const azureProfile = profile as {
          email?: string;
          preferred_username?: string;
        };

        try {
          const email =
            azureProfile?.email?.toLowerCase() ||
            azureProfile?.preferred_username?.toLowerCase() ||
            "";

          const rawResponse = await transport.get(
            "/api/kinetics/enigma/v1.0/userProfiles",
            {
              $filter: `eMail eq '${email}' and eMail ne ''`,
              company: process.env.BC_COMPANY_NAME,
            }
          );

          if (
            !rawResponse ||
            typeof rawResponse !== "object" ||
            !Array.isArray((rawResponse as any).value)
          ) {
            throw new Error("Unexpected response structure or API failure.");
          }

          const response = rawResponse as { value: any[] };
          const userProfile = response.value[0];

          token.profile = isValidProfile(userProfile) ? userProfile : null;
          token.needsProfileSetup = !token.profile;
        } catch (error: any) {
          console.error("❌ Error fetching user profile:", {
            message: error?.message,
            stack: error?.stack,
            response: error?.response?.data,
          });
          token.error = "Failed to fetch user profile. Please try again later.";
        }
      }

      return token;
    },
  },
} satisfies NextAuthOptions);

export { handler as GET, handler as POST };
