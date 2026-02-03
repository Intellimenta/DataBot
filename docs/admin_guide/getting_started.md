# Getting Started

DataBot can be run in two different modes, depending on your needs:

- **Portable Mode (Windows)**: Ideal for quickly testing DataBot on your local machine without setting up any external dependencies. No installation is required—just download the bundle, and launch the app.

- **Docker Mode**: Suitable for both advanced local testing and production deployments. This mode gives you full access to all features, but requires Docker, a PostgreSQL database, and some additional configuration.


## Portable Mode

### Launch
- Download the latest portable version <a href="https://github.com/Intellimenta/DataBot/releases/latest" target="_blank">here</a>.
- Unzip the file.
- Click on `launch_databot.bat` to run DataBot.
- Browse `http://127.0.0.1:5000` to access the app.

### Configuration

At the login screen, click on the Sign up button to create an account. After logging in, you can access the admin panel by clicking on the gear icon at the top-right of the app and selecting "Admin Panel".

- **Set the OpenAI API Key** in "LLM Config" tab.
- **Add a Database Connection**. You can either manually add a connection or sync with your BI tool.
    - To manually add a database connection, click on 'Add Database Connection'.
    - To connect your BI tool, see [here](./bi_integration.md).
- **Managing Access to Database Tables/Views**
    - Click on [DB Name] > Manage Permissions
    - Select tables/views that you want to query on.
    !!! note
        It is recommended to use views instead of tables for DataBot, as they provide greater flexibility. In the views:

        - Include only the columns that are relevant for answering user queries. The fewer irrelevant columns you have, the better the response quality will be.
        - Filter out rows that are redundant.
        - Perform renaming, type conversion, or any other transformations that can help make the data cleaner.

- **Managing Semantic Layer and Metadata**
    - You can provide business metrics, domain-knowledge and descriptions at database, table and column-level (Admin Panel > Database Connections > [DB Name] > Semantic Layer and Metadata Management).
    - It’s recommended to add descriptions only when it's actually helpful. For example, the column sale_date does not need a description, but a column like abc23 would. 
    - The `db schema` command shows you what metadata is shared with the LLM when you ask a question.


## Docker Mode

### Preparations
Create a PostgreSQL database to be used as the internal database for the app. There is no need to add any tables; DataBot will create those on startup. Note down the following info: `host name`, `database name`, `port`, `username` and `password`.

### Deployment (Test)
Official Docker image is available via <a href="https://hub.docker.com/r/intellimenta/databot/tags" target="_blank">DataBot's Dockerhub repository</a>. It can be deployed on any system that can run Docker.

#### Step 1: Launch a Linux server with a public IP 
Make sure to allow inbound **TCP 5000** traffic.

#### Step 2: Create a PostgreSQL DB
This will be used as the internal database for the app. There is no need to add any tables; DataBot will create those on startup. Note down the following info: **host name**, **database name**, **port**, **username** and **password**.  
In the DB security group allow **5432/tcp** from the VM to database host

#### Step 3: Create a directory for DataBot
SSH into the server and run the following command:
```
mkdir databot
cd databot
```

#### Step 4: Check if Docker is already installed
```sh
docker --version
```
If Docker is installed, you’ll see something like `Docker version 24.x.x, build …`.  In this case **skip step 5**.

#### Step 5: Install Docker 
```sh
sudo apt-get update
sudo apt-get install -y ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
```
Verify installation:
```sh
docker --version
```
Allow running Docker without sudo:
```sh
sudo usermod -aG docker $USER
```
Logout and log back in to refresh your user session.

#### Step 6: Create `databot.env` file
```sh title="databot.env"
# DataBot Application Database
DATABOT_DB_HOST=***
DATABOT_DB_DATABASE=***
DATABOT_DB_PORT=***
DATABOT_DB_USER=***
DATABOT_DB_PASS=***

# The key used for password hashing and token generation.
# Select a random string. Don't change it when upgrading DataBot.
DATABOT_AUTH_KEY=***

# The License key provided to you by the DataBot team.
DATABOT_LICENCE_KEY=***

# remove in production
DATABOT_ALLOW_HTTP=true
```

#### Step 7: Deploy
Run the DataBot container:
```sh
docker run -d -p 5000:5000 --name databot --env-file ./databot.env intellimenta/databot:latest
```
You can use the command `docker ps -a` to check if the container is running and see the container id.  
If the container status is "Exited", you can use `docker logs <container-id>` to see the logs and troubleshoot the issue.  
Once the container is running, you can access the app at `http://[instance-public-ip]:5000` (`http://127.0.0.1:5000` if deployed locally).

#### Production Deployment
For production deployment (over HTTPS), see [here](./production_deployment.md).

### Configuration

The first user to create an account becomes the DataBot admin. They can grant admin privileges to other users by adding them to the Admins group in DataBot.

After creating an account and logging in as admin, it's time for configuring the app. You can access the admin panel by clicking on the gear icon at the top-right of the app and selecting "Admin Panel".

- **Set the OpenAI API Key** in "LLM Config" tab.
- **Add a Database Connection**. You can either manually add a connection or sync with your BI tool.
    - To manually add a database connection, click on 'Add Database Connection'.
    - To connect your BI tool, see [here](./bi_integration.md).
- **Manage Users Access to Database Tables/Views**
    - In DataBot, groups are used to manage table-level access; Users are assigned to groups, and groups are given access to tables. 
    - There are two built-in groups: Admins and Default. All new users are automatically added to the Default group. You can add and manage groups in Admin Panel > User Management > User Groups.
    - To specify which user groups should have access to which tables from a database, go to Admin Panel > Database Connections > [DB Name] > Manage Permissions.
    !!! note
        It is recommended to use views instead of tables for DataBot, as they provide greater flexibility. In the views:

        - Include only the columns that are relevant for answering user queries. The fewer irrelevant columns you have, the better the response quality will be.
        - Filter out rows that are redundant.
        - Perform renaming, type conversion, or any other transformations that can help make the data cleaner.

- **Manage Semantic Layer and Metadata**
    - You can provide business metrics, domain-knowledge and descriptions at database, table and column-level (Admin Panel > Database Connections > [DB Name] > Semantic Layer and Metadata Management).
    - The `db schema` command shows you what data is shared with the LLM when you ask a question.
- **Email Setup**
Setup email (Settings > Admin Panel > Email Setup) so new users can verify their email address. It's also used for password-reset functionality.
- **Query Suggestions**
New users usually don't know what type of questions they can ask. Adding query suggestions (Settings > Admin Panel > Query Suggestions) can greatly help with that. Users would see the query suggestions in the main page when they login.
- **Add Text-to-SQL Translation Tests**  
When DataBot answers users' analytical questions, it goes through a series of steps. One of the most critical steps is the text-to-SQL translation. If this step is not performed correctly, the insights provided to users may be unreliable.  
For this reason, it is crucial to ensure that the text-to-SQL translation is working correctly. See [here](./admin_panel_overview.md#text-to-sql-translation-tests) for more details.
