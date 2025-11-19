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

- **Managing Metadata**
    - You can provide domain-knowledge and descriptions at database, table and column-level (Admin Panel > Database Connections > [DB Name] > Manage Metadata).
    - It’s recommended to add descriptions only when it's actually helpful. For example, the column sale_date does not need a description, but a column like abc23 would. 
    - The db schema command shows you what metadata is shared with the LLM when you ask a question.


## Docker Mode

### Preparations
Create a PostgreSQL database to be used as the internal database for the app. There is no need to add any tables; DataBot will create those on startup. Note down the following info: `host name`, `database name`, `port`, `username` and `password`.

### Deployment
Official Docker image is available via <a href="https://hub.docker.com/r/intellimenta/databot/tags" target="_blank">DataBot's Dockerhub repository</a>. It can be deployed on any system that is running Docker.

Create a file for storing environment variables:
```sh title="env_vars"
# DataBot Application Database
DATABOT_DB_HOST=***
DATABOT_DB_DATABASE=***
DATABOT_DB_PORT=***
DATABOT_DB_USER=***
DATABOT_DB_PASS=***

DATABOT_AUTH_KEY=***  # The key used for password hashing and token generation.
                      # Select a random string. Don't change it when upgrading DataBot.

DATABOT_LICENCE_KEY=***  # The License key provided to you by the DataBot team.

DATABOT_ALLOW_HTTP=true  # remove in production
```

#### Local
Pull the latest docker image:
```sh
docker pull intellimenta/databot:latest
```
Then run the DataBot container (assuming the environment variables are stored in the file `env_vars`):
```sh
docker run -d -p 5000:5000 --name databot --env-file ./env_vars intellimenta/databot
```
This will start a local DataBot server on port 5000. You can then access the app at `http://localhost:5000`.

#### In the Cloud (over HTTP)

Use a service that can run containers, such as compute services (e.g., AWS EC2, GCP Compute Engine, Azure Virtual Machines) or managed container services (e.g., AWS ECS, GCP Cloud Run, Azure Container Apps). Below, we provide instructions for AWS EC2:

- Create an EC2 instance with public internet access
- SSH to the EC2 instance
- Create a file called env_vars containing the environment variables
- Pull the latest DataBot docker image: 
`docker pull intellimenta/databot:latest`
- Run the DataBot container:
`docker run -d -p 80:5000 --env-file env_vars intellimenta/databot`
- You can use the command `docker ps -a` to check if the container is running and see the container id.
- If the container status is "Exited", you can use `docker logs <container-id>` to see the logs and troubleshoot the issue.
- Once the container is running, you can access the app by browsing the public IP address of the EC2 instance. E.g. if the public IP address is 172.30.40.243, then you should browse http://172.30.40.243

#### Production
For production deployment (over HTTPS), see [here](./production_deployment.md).

### Configuration

The first user to create an account becomes the DataBot admin. They can grant admin privileges to other users by adding them to the Admins group in DataBot.

After creating an account and logging in as admin, it's time for configuring the app. You can access the admin panel by clicking on the gear icon at the top-right of the app and selecting "Admin Panel".

- **Set the OpenAI API Key** in "LLM Config" tab.
- **Add a Database Connection**. You can either manually add a connection or sync with your BI tool.
    - To manually add a database connection, click on 'Add Database Connection'.
    - To connect your BI tool, see [here](./bi_integration.md).
- **Managing Users Access to Database Tables/Views**
    - In DataBot, groups are used to manage table-level access; Users are assigned to groups, and groups are given access to tables. 
    - There are two built-in groups: Admins and Default. All new users are automatically added to the Default group. You can add and manage groups in Admin Panel > User Management > User Groups.
    - To specify which user groups should have access to which tables from a database, go to Admin Panel > Database Connections > [DB Name] > Manage Permissions.
    !!! note
        It is recommended to use views instead of tables for DataBot, as they provide greater flexibility. In the views:

        - Include only the columns that are relevant for answering user queries. The fewer irrelevant columns you have, the better the response quality will be.
        - Filter out rows that are redundant.
        - Perform renaming, type conversion, or any other transformations that can help make the data cleaner.

- **Managing Metadata**
    - You can provide domain-knowledge and descriptions at database, table and column-level (Admin Panel > Database Connections > [DB Name] > Manage Metadata).
    - It’s recommended to add descriptions only when it's actually helpful. For example, the column sale_date does not need a description, but a column like abc23 would. 
    - The db schema command shows you what data is shared with the LLM when you ask a question.
- **Email Setup**
Setup email (Settings > Admin Panel > Email Setup) so new users can verify their email address. It's also used for password-reset functionality.
- **Query Suggestions**
New users usually don't know what type of questions they can ask. Adding query suggestions (Settings > Admin Panel > Query Suggestions) can greatly help with that.