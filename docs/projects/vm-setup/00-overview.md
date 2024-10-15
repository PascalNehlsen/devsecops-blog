# Virtual Machine Setup with Nginx and SSH Configuration

In this blog post, you’ll learn how to configure an existing virtual machine (VM) with nginx as a web server while also setting up a secure SSH configuration. We will walk through generating SSH keys, disabling password-based authentication, using SSH aliases, and managing multiple SSH identities.

## Quick Start (README)

### Prerequisites

- A Linux-based server with SSH access
- Root or sudo privileges

1. Generate an SSH Key
   Generate an SSH key on your local machine to secure access to your server:

```bash
ssh-keygen -t ed25519
```

Follow the instructions and store the key in a secure location. Optionally, you can add a passphrase for extra security.

2. Login to the VM
   Login to your virtual machine using SSH (replace with your VM’s IP address):

```bash
ssh USER@192.655.265.55
```

Accept the fingerprint and enter your server’s password.

3. Store the SSH Key on the VM
   Copy your public SSH key to the VM:

```bash
ssh-copy-id -i ~/.ssh/key.pub USER@192.655.265.55
```

Now you can log in using the key:

```bash
ssh -i ~/.ssh/key.pub USER@192.655.265.55
```

4. Disable Password Authentication
   For enhanced security, disable password-based login on the server.

- First, verify that you can log in with your SSH key.
- Edit the SSH configuration on the server:

```bash
sudo nano /etc/ssh/sshd_config
```

Find the `PasswordAuthentication` line and change it from:

```bash
#PasswordAuthentication no
```

to:

```bash
PasswordAuthentication no
```

4. Save the file and restart the SSH service:

```bash
sudo systemctl restart ssh.service
```

5. Install and Configure Nginx
   Install nginx to run the server as a web server:

- Update the package repositories:

```bash
sudo apt update
```

- Install nginx:

```bash
sudo apt install nginx -y
```

Open the server in your browser (using the VM's IP address).

6. Set Up an Alternate Index for Nginx
   Create an alternative index page and configure nginx to serve it on a different port (8081).

- Create a new directory for the alternate site:

```bash
sudo mkdir /var/www/alternatives
```

- Create the new index.html:

```bash
sudo touch /var/www/alternatives/your-index.html
```

- Add content to `your-index.html`:

```bash
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

- Configure nginx to serve this site on port 8081:

```bash
sudo nano /etc/nginx/sites-enabled/alternatives
```

- Add the following configuration:

```nginx
server {
    listen 8081;
    listen [::]:8081;

    root /var/www/alternatives;
    index your-index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

- Restart the nginx service:

```bash
sudo service nginx restart
```

Open the server in your browser with the VM’s IP address and port 8081.

# Detailed Explanation (Writeup)

1. Why Use SSH Keys and Disable Password Authentication?
   SSH keys provide stronger authentication compared to password-based login. By disabling password login, you add an extra layer of security, reducing the risk of brute-force attacks. This is especially important when managing servers in production environments.

2. Setting Up Nginx for Multiple Sites
   By configuring nginx to serve an alternative `index.html` on a different port, you can host multiple websites or test environments on the same server. This is a useful approach for separating staging environments or hosting multiple microservices.

3. Using SSH Aliases for Easier Connections
   Instead of typing out long SSH commands every time, you can create an alias for frequently accessed servers. For example, add the following alias to your shell configuration (~/.bashrc or ~/.zshrc):

```bash
alias myserver="ssh -o StrictHostKeyChecking=False -i ~/.ssh/key.pub USER@192.655.265.55"
```

This allows you to connect to your server by simply typing:

```bash
myserver
```

4. Managing Multiple SSH Identities
   If you work with multiple servers, each with its own SSH key, you can manage them using the SSH configuration file. This allows you to use different keys for different servers without having to specify them each time you connect.

Edit your `~/.ssh/config` file and add an entry for each server:

```bash
Host myserver
    User your_username
    HostName 192.655.265.55
    IdentityFile ~/.ssh/key
```

Now you can connect to your server with:

```bash
ssh myserver
```

### Conclusion

By following this guide, you can set up a secure and efficient virtual machine with nginx for web hosting and SSH keys for access control. Implementing SSH aliases and multiple identities further streamlines server management, especially when dealing with multiple environments.

If you have any questions or need further assistance, feel free to reach out!

## Contact

- Pascal Nehlsen - [LinkedIn](https://www.linkedin.com/in/pascal-nehlsen) - [mail@pascal-nehlsen.de](mailto:mail@pascal-nehlsen.de)
- Project Link: [https://github.com/PascalNehlsen/v-server-setup](https://github.com/PascalNehlsen/v-server-setup)
