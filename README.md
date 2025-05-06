# 🚀 ESS Portal – Business Central + Next.js Integration

This is a full-stack web application built with **Next.js (App Router)** that connects to **Microsoft Business Central** using the custom [`hypernexus`](https://github.com/kinetics254/hypernexus) integration library. It also supports dynamic database switching between **PostgreSQL** and **MySQL**, and is deployed under a base path `/selfservice`.

---

## 📦 Tech Stack

- **Frontend**: Next.js 15 (App Router, React 19)
- **Backend API**: Next.js API Routes
- **Business Central API**: `hypernexus` (custom OData & SOAP transport)
- **Database**: PostgreSQL or MySQL (switchable via `.env`)
- **Authentication**: Microsoft SSO (Azure AD)
- **Languages**: TypeScript + JavaScript

---

## ⚙️ Getting Started

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/kinetics254/nehemiah.git ess-portal
cd ess-portal


2. ⚙️ Environment Setup
Create your environment file:
cp .env.example .env.local

Then edit .env.local and fill in your Business Central and database credentials.
Example:

########################################
#APP CONFIG
########################################
LOG_LEVEL=debug

NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="some-secret-key"

#########################################
# 🔗 Business Central Configuration
#########################################

BC_API_BASE_URL=http://DOMAIN:PORT/INSTANCE
BC_AUTH_TYPE=ntlm
BC_USERNAME=
BC_PASSWORD=
BC_COMPANY_NAME=


#########################################
# 🗃️ Database Configuration
#########################################

# Choose which database to use: "mysql" or "postgres"
DB_TYPE=postgres


# PostgreSQL Settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=mydb


# MySQL Settings
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DB=mydb

#########################################
# 🔐 Azure AD Authentication
#########################################

AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_REDIRECT_URI="http://localhost:3000/api/auth/callback/azure-ad"
AZURE_AD_TENANT_ID="your-azure-tenant-id"
AZURE_AD_SCOPE="https://graph.microsoft.com/.default"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"

3. 📚 Install Dependencies

npm install

4. 🌐 Configure Base Path
To access the app via http://localhost:3000/, edit your next.config.js:

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/selfservice',
};

module.exports = nextConfig;

5. 🚀 Run the Dev Server

npm run dev

Visit: http://localhost:3000/


🌐 API Routes
Each API route communicates with Business Central through the hypernexus transport layer.

Route	Description
/api/bc	Test connection to BC
/api/bc/leave-balances	Get leave balances
/api/bc/users	Get user list
/api/bc/employees	Get employee details
```
