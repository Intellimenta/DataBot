# Upgrading DataBot

### Standalone Mode
- Download the bundle for the [desired version](https://github.com/Intellimenta/DataBot/releases).
- Ununzip it. 
- Replace the `db\data` folder with the one from the current standalone installation.

### Docker Mode
- Backup the DataBot Postgres Database.
- Update the image version in your deployment configuration.