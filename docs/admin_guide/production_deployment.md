# Production Deployment

For production deployment, it's recommended to run the app over HTTPS. The environment variable `DATABOT_ALLOW_HTTP` should be removed or set to `false`.

For serving the app over HTTPS, you can use a load balancer, or a reverse-proxy (such as Caddy or Nginx). For a reverse-proxy, Caddy is preferred as it handles HTTPS and WebSockets automatically (DataBot uses WebSockets).  
If you are using a load balancer, the healthcheck endpoint is `/healthcheck`.

## Deployment on a VM with Public IP Using Reverse-Proxy
### Step 0: Prerequisites
- **A Linux server with a public IP** (recommended: Ubuntu 22.04+)
- **A domain name** you control
- **DNS record set**
    - Create an **A record** pointing your domain (example: databot.yourcompany.com) to your server's public IP.
- **A PostgreSQL Database**
    - Create a PostgreSQL database to be used as the internal database for the app. There is no need to add any tables; DataBot will create those on startup. Note down the following info: **host name**, **database name**, **port**, **username** and **password**.
- **Open firewall / security group ports**
    - Allow inbound **TCP 80** and **TCP 443**
    - (Optional) Allow **TCP 22** for SSH
- On the PostgreSQL host, **ensure network access from the VM to the DataBot database**.
    - Allow **5432/tcp** from the VM to database host
    - If Database host is private, VM should be in the same VPC.

### Step 1: Install Dependencies
SSH into the server and run the following command:
```sh
sudo apt-get update
sudo apt-get install -y ca-certificates curl
```
### Step 2: Check if Docker is already installed
```sh
docker --version
```
If Docker is installed, you’ll see something like `Docker version 24.x.x, build …`.  In this case **skip step 3**.

### Step 3: Install Docker 
```sh
curl -fsSL https://get.docker.com | sudo sh
```
Verify installation:
```sh
docker --version
docker compose version
```
Allow running Docker without sudo:
```sh
sudo usermod -aG docker $USER
```
Logout and log back in to refresh your user session.

### Step 4: Create a directory for DataBot
```sh
mkdir databot
cd databot
```

### Step 5: Store secrets (replace `******` with actual values)
```sh
sudo mkdir -p /etc/databot/secrets
# password for internal database of DataBot you created
printf '%s' '******' | sudo tee /etc/databot/secrets/db_pass > /dev/null
# The Licence key provided to you by the DataBot team.
printf '%s' '******' | sudo tee /etc/databot/secrets/licence_key > /dev/null
# The key used for password hashing and token generation. 
# Select a random string. Don't change it when upgrading DataBot.
printf '%s' '******' | sudo tee /etc/databot/secrets/auth_key > /dev/null

# Ensure all secret files and the directory are owned by root only
# This prevents non-root users on the host from accessing or modifying them
sudo chown -R root:root /etc/databot/secrets

# Set directory permissions to 700:
# - Owner (root) can read, write, and enter the directory
# - No other users can list or access its contents
sudo chmod 700 /etc/databot/secrets

# Set all secret files to 600:
# - Owner (root) can read and write
# - No other users can read, write, or execute
sudo chmod 600 /etc/databot/secrets/*
```

### Step 6: Create `docker-compose.yaml` (replace `******` with actual values)
```yaml
services:
  databot:
    # it's recommended to use a specific image tag instead of using 'latest' (e.g. intellimenta/databot:v3.10)
    image: intellimenta/databot:latest
    volumes:
      - /etc/databot/secrets:/run/secrets:ro
    environment:
      # non-secrets (replace ****** with actual values)
      DATABOT_DB_HOST: "******"
      DATABOT_DB_DATABASE: "******"
      DATABOT_DB_PORT: "******"
      DATABOT_DB_USER: "******"
      
      # secrets as file path
      DATABOT_DB_PASS_FILE: "/run/secrets/db_pass"
      DATABOT_LICENCE_KEY_FILE: "/run/secrets/licence_key"
      DATABOT_AUTH_KEY_FILE: "/run/secrets/auth_key"
    restart: unless-stopped

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

### Step 7: Create `Caddyfile` (replace `databot.yourdomain.com` with actual value)
Caddy automatically obtains a TLS certificate (and renews it) allowing HTTPS access.
```
databot.yourdomain.com {
  reverse_proxy databot:5000
}
```


### Step 8: Deploy
- Start DataBot + Caddy: `docker compose up -d`  
- Check Status: `docker compose ps -a`  
- If the DataBot container status is "Exited", you can use `docker compose logs databot` to see the logs and troubleshoot the issue.
- Follow Caddy logs: `docker compose logs -f caddy` to make sure TLS certificate is obtained successfully.
- Verify the deployment by openning `https://<your-domain>`

## Deployment on a VM with Private IP
When the VM is private, Caddy shouldn't be part of the `docker-compose.yaml`:
```yaml
services:
  databot:
    # it's recommended to use a specific image tag instead of using 'latest' (e.g. intellimenta/databot:v3.10)
    image: intellimenta/databot:latest
    volumes:
      - /etc/databot/secrets:/run/secrets:ro
    environment:
      # non-secrets (replace ****** with actual values)
      DATABOT_DB_HOST: "******"
      DATABOT_DB_DATABASE: "******"
      DATABOT_DB_PORT: "******"
      DATABOT_DB_USER: "******"
      
      # secrets as file path
      DATABOT_DB_PASS_FILE: "/run/secrets/db_pass"
      DATABOT_LICENCE_KEY_FILE: "/run/secrets/licence_key"
      DATABOT_AUTH_KEY_FILE: "/run/secrets/auth_key"
    restart: unless-stopped
```
If DataBot is meant to be accessed only from your private network, then:

- No public DNS record required (or use internal DNS)
- No public 80/443 exposure
- Access through VPN, Direct Connect, site-to-site, or corporate network routing

If DataBot needs to be accessed from outside the private network, then:

- The simplest solution is to put a load balancer in front of the private VM and create a CNAME record pointing to the DNS name of the load balancer (or create an alias if DNS provider is internal, e.g., Route 53)
- Another solution is to install Caddy on a public "ingress" (bastion) host, and create an A record pointing your domain (example: databot.yourcompany.com) to the Caddy server's public IP

## Deployment using Managed Docker Services
You can deploy DataBot using managed Docker services in the cloud, for example AWS ECS, GCP Cloud Run, Azure Container Apps.

## Misc.
As mentioned above, for reverse-proxy, Caddy is preferred as it handles WebSockets and HTTPS automatically. But if you decide to use Nginx, you need to add configurations for handling the WebSocket endpoint (`/ws`) and HTTPS. In the code below replace `databot.yourdomain.com` with your actual domain. You need to handle SSL as well (you can get an SSL certificate via Let's Encrypt).

```
server {
    server_name databot.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SSL configuration
    # ...
}
```