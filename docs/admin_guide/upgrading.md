# Upgrading DataBot

### Portable Mode
- Download the bundle for the [desired version](https://github.com/Intellimenta/DataBot/releases).
- Ununzip it. 
- Copy the `data` folder (`db\data`) from the previous version to the `db` folder of the new version.

### Docker Mode
- Backup the DataBot Postgres Database.
- Update the image version in your deployment configuration.