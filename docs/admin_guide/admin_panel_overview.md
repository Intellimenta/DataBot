# Admin Panel Overview

### LLM Config

Here you set your OpenAI API key. Your OpenAI account needs to be at least on <a href="https://platform.openai.com/docs/guides/rate-limits/usage-tiers#usage_tiers" target="_blank">tier 1</a>, as DataBot uses some features that are not available in the free tier models. Tier 3+ is recommended for production use.

Here you can also configure several features for LLM. One important feature is **web search**. When web search is enabled, user queries that cannot be answered by database data, would be answered by web search.

### Database Connections

This is where you connect your database(s), manage table-level permissions for each database, and can provide descriptions for databases, tables and columns.

### App Access Management

- **New Users Must be Granted Access Manually**: If this settings is disabled, when a user creates an account and verify their email, they can login to the app.
If this settings is enabled, when a user creates an account and verify their email, they still cannot login to the app until an admin grants them access manually in Admin Panel > User Management.
- **Only Certain Email Domains Can Create an Account**: If this setting is enabled, only the email domains that you specify can create an account. This would only affect the new signups.

### User Management

- **User Groups**:
You can create user groups and view the list of members for each group. There are two built-in groups: "Admins" and "Default".
    - When users sign up, they are automatically assigned to the "Default" group.
    - You can promote a user to admin by adding them to the "Admins" group.
- **User Group Assignment and Access Management**
You can grant or revoke access to the app for each user and assign groups to them. In DataBot, groups are used to manage table-level access; Users are assigned to groups, and groups are granted access to tables.
- **Custom User Attributes**
You can create custom user attributes. These attributes can be used in the following two ways to make sure users see only what they are supposed to see:
    - For defining row-level access control
    - For auto-filtering dashboards in "Dashboards + Chatbot Layout". These filters would be "locked" filters, meaning the users would not be able to see or change these filters.

### Email Setup

The email setup is required for email user sign-up and password-reset functionality.

### Default Language for All Users

You can set the default language which would apply to new users. Each user can set their own language preference in Settings > Language. The language would affect voice transcription, chatbot responses, and action buttons.

### Query Suggestions

<figure markdown="1">
![Query Suggestions](../assets/query-suggestions.png){ width="600" }
</figure>

In this section, you can define sample queries to be displayed on the homepage. This will greatly help new users understand the types of questions they can ask.

### Text-to-SQL Translation Tests

<figure markdown="1">
![Text-to-SQL Translation Tests](../assets/text-to-sql-tests.png){ width="600" }
</figure>

In this section, you can define test cases along with their expected SQL query. You can then run these tests to verify if they all pass. If a test fails, you can see the reason for the failure. You can modify the semantic layer and metadata (business metrics, descriptions of the database, tables, and fields) in  `Admin Panel > Database Connections > [DB Name] > Semantic Layer and Metadata Management` accordingly to fix the errors and run the tests again.

### Integration with BI Tools

!!! note

    Currently only **Metabase** is supported for BI integration. If you need integration with other BI tools, let us know.

Connecting DataBot to your BI tool allows you to

- Use the database connections defined in your BI tool for DataBot (instead of manually adding a database connection)
- Use the dashboards created in your BI tool as a data source for answering questions in DataBot
- Use the 'Dashboards + Chatbot' layout (explained below)

When the 'Dashboards + Chatbot' layout is enabled, after user login, the dashboards that the user has access to would be shown (plus a dashboard picker for switching between dashboards), and DataBot would be shown as a widget in bottom-right corner of screen. This format is ideal for **customer-facing analytics**, e.g. if you are sharing one or more dashboards with your customers.

![Dashboards + Chatbot Interface](../assets/bi-integration-1.png)
<br>
By clicking the widget, the chat interface becomes visible.
<br>
<br>
![Dashboards + Chatbot Interface](../assets/bi-integration-2.png)

In "Dashboard + Chatbot Interface" tab, you can specify which dashboards should be available to each user group. For each dashboard id mentioned here, you need to enable embedding for it in Metabase (Top-right section of dashboard > Sharing > Embed > Static Embedding > Publish). If that option is not available, it means you haven't enabled static embedding in your Metabase instance (Admin Panel > Settings > Embedding).

You can also associate user attributes with dashboard filters so the dashboards are automatically filtered (locked filters) using the user attribute value. This ensures users only access the data they are meant to see. You need to:

- Enable "Auto-Filter Dashboards by User Attributes" in DataBot Admin Panel > BI Integration > 'Dashboards + Chatot Interface'
- Create a filter in your Metabase dashboard with the same name as the user attribute.
- Tie the filter to relevant cards of the dashboard. 
- In [Top-right section of dashboard > Sharing > Embed > Static Embedding > Parameters] make the filter "Editable" and publish.

### Row-level Security (RLS)

While the Database Connections tab manages table-level access for user groups, this section allows you to manage row-level access for user groups.

### Data Obfuscation

You can specify which columns' data should be obfuscated for each user group. Obfuscation is done using dynamic data masking. In other words, the mask is dynamically applied on the specified column(s) without the need to hard-code it in your database.

![Data Obfuscation](../assets/data-obf.png)

### White-Labeling

In this section you can replace the DataBot name and logo, and provide your own demo link (which will be shown to new users).

The configurations in this section will take effect only if white-labeling is enabled in your license key.

### Compliance
If some of you clients require that their chats don't be stored in the database, you can provide their email domain in this tab.

### Misc.

- **Send Errors to the DataBot Cloud Server for Analysis**
This helps us better assist you in the event of an application error. It also allows us to take a proactive approach and release patches in a timely manner.
- **Send anonymized usage data to the DataBot cloud server to help improve DataBot**
Anonymizing converts a value like 'support@intellimenta.com' to 'e86477008dc34c19b50d9aad9fe12d935db2d1289edd2cbc'. Collecting anonymized data helps us improve DataBot.

