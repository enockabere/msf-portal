export const logoutMicrosoft = () => {
  localStorage.removeItem("employee");
  const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!;
  const postLogoutRedirectUri = encodeURIComponent(
    `${window.location.origin}/selfservice`
  );
  const logoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`;

  window.location.href = logoutUrl;
};
