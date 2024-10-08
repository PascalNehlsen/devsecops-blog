# Virtual Machine Setup with Nginx and SSH Configuration

This project demonstrates how to configure an existing server with **nginx**, generate and use **SSH keys** for secure login, disable password-based authentication, use **aliases** for SSH connections, and manage multiple **SSH identities**.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Contact](#contact)

## About the Project

This project focuses on setting up an existing server with **nginx** for web hosting. Additionally, it covers the secure configuration of **SSH** by generating SSH keys, using aliases for simpler SSH commands, disabling password-based login for enhanced security, and managing multiple SSH identities.

### Technologies

- **nginx** for the web server
- **SSH** for secure server access

## Features

- Set up and configure nginx on the server
- Generate and use SSH keys for secure login
- Disable password-based SSH login for security
- Use SSH aliases for easier login commands
- Manage multiple SSH identities for different servers

## Prerequisites

- An existing server (Linux-based) with SSH access
- Login data for the virtual machine
- Root or sudo privileges on the server

## Usage

### Generating an SSH Key

To secure access to your server, generate an SSH key on your local machine:

Generate a new SSH key:

```
ssh-keygen -t ed25519
```

- Specify the path where you want to store the key
- Enter passphrase depending on personal requirements

### Login

Login to your Virtual Machine (example ip address):

```
ssh USER@192.655.265.55
```

- Remember fingerprint
- Enter your login password for the server

### Store SSH key

Store the SSH key on your virtual machine (example path):

```
ssh-copy-id -i ~/.ssh/key.pub USER@192.655.265.55
```

- **Important:** Use the public (key.pub) key
- Enter your login password for the server
- Login to the server using the ssh key

```
ssh -i ~/.ssh/key.pub USER@192.655.265.55
```

### Deactivate the password login

For your safety we are deactivating the password login:

- **Important:** First try if you can log in with your ssh key!
- Go to the server config:

```
sudo nano /etc/ssh/sshd_config
```

- Search for the PasswordAuthentication entry

```
#PasswordAuthentication no
```

- Remove the comment character (entry color is changing)
- Save the file
- Restart the SSH service:

```
sudo systemctl restart ssh.service
```

### Start your webserver

Install nginx to open the machine as a web server:

- Update your repositories on the Server:

```
sudo apt update
```

- Install nginx:

```
sudo apt install nginx -y
```

- Open the server on your Browser (the address is your vm ip)

### Display alternative index with nginx

- Create the alternate directory:

```
sudo mkdir /var/www/alternatives
```

- Create your alternative index.html:

```
sudo touch /var/www/alternatives/your-index.html
```

- Configure nginx:

```
sudo nano /etc/nginx/sites-enabled/alternatives
```

- Configure the following file for port 8081:

```
server {
    listen: 8081;
    listen[::]8081;

    root /var/www/alternatives;
    index your-index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

- Create your alternate index.html:

```
sudo nano /var/www/alternatives/your-index.html
```

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Index</title>
</head>
<body>
    <h1>Hello, this is my new index.html!</h1>
</body>
</html>
```

- Restart your nginx service:

```
sudo service nginx restart
```

- Open the server on your Browser (the address is your vm ip + port :8081)

### SSH connection aliases

- Create your alias with an absolute path:

```
alias your_alias="ssh -o StrictHostKeyChecking=False -i ~/.ssh/key.pub USER@192.655.265.55"
```

- Show all existing alias:

```
alias
```

- Login with your alias:

```
your_alias
```

### SSH config for multiple identities

- Change the config file of your SSH

```
nano ~/.ssh/config
```

```
HOST 192.655.265.55
  User your_username
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/key (the private key)
```

- Login through your identity:

```
ssh 192.655.265.55
```

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/v-server-setup](https://github.com/PascalNehlsen/v-server-setup)
