# BI Integration

Connecting DataBot to your BI tool allows you to

- Use the database connections defined in your BI tool for DataBot
- Use the dashboards created in your BI tool as a data source for answering questions in DataBot
- Use the ['Dashboards + Chatbot' interface](./admin_panel_overview.md#bi-integration), where one or more dashboards are shown on the left (with a dashboard picker to switch between dashboards) and the chatbot is shown on the right. This interface is ideal for customer-facing analytics where you are sharing one or more dashboards with your customers.

Currently only Metabase is supported for BI integration. We are planning to add support for other BI tools such as Redash and Apache Superset in the near future.

### Preparations

- Create a collection in your Metabase instance for DataBot and note down its collection ID (only the numerical part).
- Create an API key in your Metabase instance (Metabase Admin Panel > Authentication > API Keys), and add it to the Administrators group. Note down the API key.
- In Metabase, add "(DataBot)" to the end of the display name of the DB connection that you want to query.

### Configuration

- Go to DataBot Admin Panel > BI Integration
- Provide the details for connecting to Metabase and save.
- Refresh the page.
- Go to DataBot Admin Panel > Database Connections
- Click on 'Sync with Metabase'
- Click on the connection name(s) retrieved from Metabase
- Manage table permissions and metadata similar to manually-added connections.

