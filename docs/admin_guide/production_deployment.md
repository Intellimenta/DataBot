# Production Deployment

For production deployment, it's recommended to run the app over HTTPS. You should remove the environment variable `DATABOT_ALLOW_HTTP` or set it to false.

For serving the app over HTTPS, you can use a load balancer, or a reverse proxy (such as Nginx) or other methods.

If you are using a Load Balancer, the healthcheck endpoint is `/healthcheck`.

### NginX Config 

If you are using Nginx, make sure to handle the WebSocket endpoint (`/ws`) and forwards the protocol of the original request (HTTPS). In the code below replace `your-domain.com` with your actual domain. You need to handle SSL as well (you can get an SSL certificate via Let's Encrypt).

```
server {
    server_name your-domain.com;

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

### Adding Text-to-SQL Translation Tests

Changes in your deployed DataBot setup may happen due to a variety of reason, such as:

- Making a new table or view queryable in the chatbot
- Adding or removing a column from a table or view that is already queryable
- Changing the LLM model (e.g., due to temporary downtime)
- ...

It's crucial to ensure that response quality remains unaffected after making changes to your setup. That’s where Text-to-SQL Translation Tests come into play. See [here](./admin_panel_overview.md#text-to-sql-translation-tests) for more details.
