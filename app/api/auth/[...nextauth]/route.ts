/* eslint-disable @typescript-eslint/no-explicit-any */
import { transport } from "@brainspore/hypernexus";
import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            profile?: Record<string, any> | null
        }
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
    // pages: {
    //     signIn: '/'
    // },
    callbacks: {
        // async redirect({ url, baseUrl }) {
        //     const urlObject: URL = new URL(url);
        //     console.log('url', url)
        //     console.log('object url', urlObject)
        //     if (url.startsWith("/")) return `${baseUrl}${url}`
        //     else if (urlObject.pathname !== "/") return url
        //     else return `${baseUrl}/dashboard`
        // },
        async session({ session, token }) {
            session.user.profile = token.profile as Record<string, any> | null;
            return session
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token
                // Note: for Azure AD, profile.oid is the unique user ID
                // and profile.email or profile.preferred_username contains the email
                const employee = await transport.get(
                    "/api/KineticTechnology/ESS/v1.0/leavemployees",
                    {
                        $filter: `email eq '${profile?.email}'`,
                        company: process.env.BC_COMPANY_NAME
                    }
                ) as Record<string, any> | null;
                if (employee && Object.keys(employee)) {
                    if (Array.isArray(employee?.value) && employee?.value.length) {

                        token.profile = employee?.value.at(0)
                    } else {
                        token.profile = {
                            role: "Other User"
                        }
                    }
                }
            }
            return token
        }
    }
});

export { handler as GET, handler as POST }