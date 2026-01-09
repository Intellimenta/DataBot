# Production Deployment

For production deployment, it's recommended to run the app over HTTPS. The environment variable `DATABOT_ALLOW_HTTP` should be removed or set to `false`.

For serving the app over HTTPS, you can use a load balancer, or a reverse proxy (such as Caddy or Nginx). For reverse-proxy, Caddy is preferred as it handles https and WebCockets automatically (DataBot uses WebSockets).  
If you are using a Load Balancer, the healthcheck endpoint is `/healthcheck`.

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
- On the Postgres Database host containing the DataBot DB, **ensure network access from VM to the DB**
  - Allow **5432/tcp** from the vm to database host
  - If Database host is private, VM should be in the same VPC.

### Step 1: Install Dependencies
SSH into the server and run the following command:
```sh
sudo apt-get update
sudo apt-get install -y unzip ca-certificates curl
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
newgrp docker
```
### Step 4: Download the DataBot installation bundle on the server
```
curl -L https://databot-downloads.s3.us-west-2.amazonaws.com/databot-deployment.zip -o databot.zip
unzip databot.zip
cd databot
```
The bundle contains the following 3 files:  
`env_vars`
```sh
# DataBot Application Database
DATABOT_DB_HOST=***
DATABOT_DB_DATABASE=***
DATABOT_DB_PORT=***
DATABOT_DB_USER=***
DATABOT_DB_PASS=***

DATABOT_LICENCE_KEY=***  # The License key provided to you by the DataBot team.
DATABOT_AUTH_KEY=***  # The key used for password hashing and token generation.
                      # Select a random string. Don't change it when upgrading DataBot.
```
`docker-compose.yaml`
```yaml
services:
  databot:
    # it's recommended to use a specific image tag instead of using 'latest'
    image: intellimenta/databot:latest
    env_file:
      - ./env_vars
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
`Caddyfile`
```
# replace "databot.yourdomain.com"
databot.yourdomain.com {
  reverse_proxy databot:5000
}
```
### Step 5: Replace the example values with your own  
- In `env_vars` provide values. 
- In `Caddyfile` replace "databot.yourdomain.com" with the domain name you have pointed to the VM.
- (Recommended) In `docker-compose.yaml`, in the line `image: intellimenta/databot:latest`, instead of `latest` use a specific image tag (e.g. `image: intellimenta/databot:v3.8.6`).
### Step 6: Deploy
- Start DataBot + Caddy: `docker compose up -d`  
- Check Status: `docker compose ps -a`  
- If the DataBot container status is "Exited", you can use `docker compose logs databot` to see the logs and troubleshoot the issue.
- Follow Caddy logs: `docker compose logs -f caddy`  
If DNS and ports are correct, Caddy will automatically obtain and renew TLS certificates.
- Verify deployment is working by browsing `https://<your-domain>`

## Deployment on a VM with Private IP
When the VM is privare, Caddy shouldn't be part of the docker-compose.yaml:
```yaml
services:
  databot:
    # it's recommended to pin to a specific (e.g., intellimenta/databot:v3.8.6) 
    # instead of using the 'latest' tag
    image: intellimenta/databot:latest
    env_file:
      - ./env_vars
    restart: unless-stopped
```
If DataBot is meant to be accessed only from the client’s private network, then:

- No public DNS record required (or use internal DNS)
- No public 80/443 exposure
- Access through VPN, Direct Connect, site-to-site, or corporate network routing

If DataBot needs to be accessed from outside the private network, then:

- The simplest solution is to put a load balancer in front of the private VM and create a CNAME record pointing to the DNS name of the load balancer (or create an alias if DNS provider is internal, e.g., Route 53)
- Another solution is to install Caddy on a public "ingress" (bastion) host, and create an A record pointing your domain (example: databot.yourcompany.com) to the Caddy server's public IP

## Deployment using Managed Docker Services
You can deploy DataBot using managed docker services in the cloud, for example AWS ECS, GCP Cloud Run, Azure Container Apps.

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