# Billing

There are two types of billing, each corresponding to a type of DataBot license key:

- **Static Billing**: In this model, payment is made in advance for a fixed number of users and a fixed period of time. For example, a license key might be purchased for one year with a 50-user cap. The expiration date, user limit, and client name are encoded in the license key provided to the client, and license validation is handled locally within the app. Discounts are available for long-term commitments or large user counts.
- **Dynamic Billing**: In this model, payment is made monthly at the end of the month on a prorated basis. For example, if you have 10 users in the first half of the month and 20 users in the second half, you would be invoiced for 15 users. In this case, license validation is done externally—i.e., at login, the app checks with our server to verify the license key. Discounts are available for large user counts.