
# Anonymous Chat Application

This guide explains how to set up and run the Anonymous Chat application on a server using Node.js, npm, and PM2 for process management.

## Prerequisites
- A server with a Linux-based OS (e.g., Ubuntu).
- Basic knowledge of terminal commands.
- Access to a domain or public IP address for testing.

## Installation and Setup

### 1. Install Node.js and npm
Update the package index and install Node.js and npm:

```bash
sudo apt update
sudo apt install nodejs npm
```

Verify the installation:

```bash
node -v
npm -v
```

Install `nvm` (Node Version Manager) to manage Node.js versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

### 2. Install PM2 for Process Management
Install PM2 globally:

```bash
sudo npm install -g pm2
```

### 3. Clone and Run the Application
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ~/anonymous-chat
npm install
```

Start the application with PM2:

```bash
cd ~/anonymous-chat
pm2 start server.js --name "anonymous-chat"
```

Set up PM2 to run on system startup and save the configuration:

```bash
pm2 startup
pm2 save
```

### 4. Verify Application
Open your browser and navigate to your domain or server IP address. The application should be accessible.

## Maintenance
Manage the application using PM2 commands:

- View logs:
  ```bash
  pm2 logs anonymous-chat
  ```

- Restart the application:
  ```bash
  pm2 restart anonymous-chat
  ```

- Stop the application:
  ```bash
  pm2 stop anonymous-chat
  ```

## Autostart Configuration
To ensure the application starts automatically after a server reboot:

Generate the autostart script:

```bash
pm2 startup
```

PM2 will provide a command to enable autostart, similar to:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
```

Execute the provided command, then save the current process list:

```bash
pm2 save
```

## Ecosystem File (Recommended)
Create an ecosystem configuration file for better process management:

```bash
nano ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [{
    name: "anonymous-chat",
    script: "server.js",
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: "200M",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
```

Save the file (`Ctrl+O`, then `Enter`, then `Ctrl+X`).

Stop and delete the existing process:

```bash
pm2 stop anonymous-chat
pm2 delete anonymous-chat
```

Start the application using the ecosystem file:

```bash
pm2 start ecosystem.config.js
```

Save the configuration:

```bash
pm2 save
```

## Post-Reboot Verification
After a server reboot, connect to the server and check the process status:

```bash
pm2 list
```

## License
MIT License
