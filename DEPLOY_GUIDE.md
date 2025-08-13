# Cloudflare Pages & Workers Deployment Guide for JDue

This guide will walk you through deploying the JDue Todo application to Cloudflare's global network. The frontend will be served by Cloudflare Pages, and the backend API will run on Cloudflare Workers, with data stored in a Cloudflare D1 database.

## Prerequisites

1.  **Cloudflare Account**: You'll need a free or paid Cloudflare account.
2.  **Node.js**: Make sure you have Node.js (v18 or later) installed.
3.  **Git**: You need Git installed and a GitHub/GitLab account to host your repository.
4.  **Wrangler CLI**: This is Cloudflare's command-line tool. Install it globally:
    ```bash
    npm install -g wrangler
    ```
5.  **Log in to Cloudflare**: Authenticate the Wrangler CLI with your Cloudflare account:
    ```bash
    wrangler login
    ```

---

## Step 1: Fork and Clone the Repository

1.  **Fork the Project**: Fork this project's repository to your own GitHub/GitLab account.
2.  **Clone Your Fork**: Clone your newly forked repository to your local machine.
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```

---

## Step 2: Create the D1 Database

1.  **Create the Database**: Run the following command to create a new D1 database. Give it a unique name.
    ```bash
    wrangler d1 create jdue-cfv-db
    ```
2.  **Update `wrangler.toml`**: The command above will output the `database_name` and `database_id`. Open the `wrangler.toml` file and paste the `database_id` into the production `database_id` and `preview_database_id` fields.

    ```toml
    # wrangler.toml
    
    [[d1_databases]]
    binding = "DB"
    database_name = "jdue-cfv-db"
    database_id = "paste-your-database-id-here" # <--- PASTE ID HERE
    preview_database_id = "paste-your-database-id-here" # <--- PASTE ID HERE TOO
    ```

---

## Step 3: Create the Database Schema

We have provided a `schema.sql` file that defines all the necessary tables (`users`, `projects`, `tasks`).

1.  **Execute the Schema**: Run the following Wrangler command to create the tables in your D1 database:
    ```bash
    wrangler d1 execute jdue-cfv-db --file=./schema.sql
    ```
    You can verify the tables were created by running `wrangler d1 info jdue-cfv-db`.

---

## Step 4: Seed the Admin User

You need to create the first administrative user manually to be able to log in.

1.  **Generate a Password Hash**: For security, you need to hash the password you want to use. You can do this with a simple script.
    *   **Recommended Script**: Run this in your terminal to create a secure hash.
        ```bash
        node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10));" "your_strong_password_here"
        ```
    *   Replace `"your_strong_password_here"` with the password you want for your admin account. Copy the resulting hash (it will start with `$2a$10$...`).

2.  **Insert the Admin User**: Now, run the following command to insert the user into your database. **Remember to replace the placeholder values!**

    ```bash
    wrangler d1 execute jdue-cfv-db --command="INSERT INTO users (id, username, email, passwordHash, isAdmin, status, passkeys_json) VALUES ('admin-user-01', 'admin', 'admin@example.com', 'PASTE_YOUR_HASHED_PASSWORD_HERE', 1, 'active', '[]');"
    ```
    
    *   Replace `PASTE_YOUR_HASHED_PASSWORD_HERE` with the hash you generated.

3.  **Create the Admin's First Project**: The application expects every user to have at least one project.
    ```bash
    wrangler d1 execute jdue-cfv-db --command="INSERT INTO projects (id, name, userId) VALUES ('default-project-01', 'Admin''s Project', 'admin-user-01');"
    ```
---

## Step 5: Configure and Deploy to Cloudflare Pages

1.  **Push Changes**: Commit and push all your local changes (especially the updated `wrangler.toml`) to your repository.
    ```bash
    git add .
    git commit -m "Configure for Cloudflare deployment"
    git push origin main
    ```
2.  **Create Pages Project**:
    *   In your Cloudflare Dashboard, go to **Workers & Pages**.
    *   Click **Create application** > **Pages** > **Connect to Git**.
    *   Select your forked repository.
3.  **Configure Build Settings**:
    *   **Project name**: Choose a name (e.g., `jdue-cfv`).
    *   **Production branch**: Select `main`.
    *   **Framework preset**: Select **None**.
    *   **Build command**: Leave this blank.
    *   **Build output directory**: Leave this as `/` (or `.` for root).
4.  **Enable D1 Binding**:
    *   Go to **Settings** > **Functions**.
    *   Under **D1 database bindings**, click **Add binding**.
    *   **Variable name**: `DB`
    *   **D1 Database**: Select your `jdue-cfv-db` database.
    *   Click **Save**.
5.  **Set Environment Variables**:
    *   Go to **Settings** > **Environment variables**.
    *   Under **Production**, click **Add variable** for each of the following. Remember to click the **Encrypt** button for `JWT_SECRET`.

| Variable name  | Value                                | Encrypt | Notes                                        |
|----------------|--------------------------------------|---------|----------------------------------------------|
| `JWT_SECRET`   | `(A long, random, secret string)`    | **Yes** | Use a password generator for a strong key.   |
| `RP_ID`        | `your-app-name.pages.dev`            | No      | The final domain for your app. No `https://`. |
| `RP_ORIGIN`    | `https://your-app-name.pages.dev`    | No      | The full final origin URL for your app.       |

6.  **Deploy**: Click **Save and Deploy**. Cloudflare will now build and deploy your application.

---

## Step 6: Add Custom Domain

Once your project is deployed, you'll be given a `*.pages.dev` subdomain. To use a custom domain:

1.  In your deployed Pages project, go to the **Custom domains** tab.
2.  Click **Set up a domain**.
3.  Enter your custom domain and follow the on-screen instructions to update your DNS records.
4.  **IMPORTANT**: If you use a custom domain, you **must** go back and update the `RP_ID` and `RP_ORIGIN` environment variables to match your new custom domain for Passkey login to work correctly.

**Congratulations! Your JDue application is now live on the Cloudflare global network.**