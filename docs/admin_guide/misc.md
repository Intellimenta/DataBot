# Misc.

### JSON Columns (PostgreSQL, MySQL) and MongoDB

By default the table name, column name, column type and first row of table/view are used to generate SQL or MongoDB code. For JSON columns or MongoDB tables, the first row might not contain the full structure. That's why for these columns, you should provide the column schema or a sample value with full structure in the column description (Admin Panel > Database Connections > [DB Name] > Semantic Layer and Metadata Management > [Table Name]).

<figure markdown="1">
![Json-MongoDB Metadata](../assets/json-metadata.png){ width="600" }
</figure>