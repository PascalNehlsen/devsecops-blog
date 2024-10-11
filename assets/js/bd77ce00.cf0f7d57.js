"use strict";(self.webpackChunkdso_dev_blog=self.webpackChunkdso_dev_blog||[]).push([[715],{5546:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>t,metadata:()=>a,toc:()=>c});var s=i(4848),r=i(8453);const t={title:"Overview"},o="Baby Tools Shop",a={id:"projects/baby-tools-shop/overview",title:"Overview",description:"Welcome to the Baby Tools Shop project! This repository contains a Django application designed for managing a baby tools e-commerce store. The project uses Docker to containerize the application and deploy it to a virtual machine (VM).",source:"@site/docs/projects/baby-tools-shop/00-overview.md",sourceDirName:"projects/baby-tools-shop",slug:"/projects/baby-tools-shop/overview",permalink:"/devsecops-blog/docs/projects/baby-tools-shop/overview",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:0,frontMatter:{title:"Overview"},sidebar:"tutorialSidebar",previous:{title:"VM Setup",permalink:"/devsecops-blog/docs/projects/vm-setup/overview"},next:{title:"Python Tools Intro",permalink:"/devsecops-blog/docs/projects/python-tools/overview"}},l={},c=[{value:"Table of Contents",id:"table-of-contents",level:2},{value:"Project Overview",id:"project-overview",level:2},{value:"Technologies",id:"technologies",level:3},{value:"Quickstart",id:"quickstart",level:2},{value:"Configuration",id:"configuration",level:2},{value:"Deploying with Docker",id:"deploying-with-docker",level:2},{value:"Hints",id:"hints",level:2},{value:"Example Photos",id:"example-photos",level:2},{value:"Home Page with login",id:"home-page-with-login",level:5},{value:"Home Page with filter",id:"home-page-with-filter",level:5},{value:"Product Detail Page",id:"product-detail-page",level:5},{value:"Register Page",id:"register-page",level:5},{value:"Login Page",id:"login-page",level:5},{value:"Contact",id:"contact",level:2}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h5:"h5",header:"header",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"baby-tools-shop",children:"Baby Tools Shop"})}),"\n",(0,s.jsxs)(n.p,{children:["Welcome to the ",(0,s.jsx)(n.strong,{children:"Baby Tools Shop"})," project! This repository contains a ",(0,s.jsx)(n.strong,{children:"Django"})," application designed for managing a baby tools e-commerce store. The project uses ",(0,s.jsx)(n.strong,{children:"Docker"})," to containerize the application and deploy it to a virtual machine (VM)."]}),"\n",(0,s.jsx)(n.h2,{id:"table-of-contents",children:"Table of Contents"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#project-overview",children:"Project Overview"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#quickstart",children:"Quickstart"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#configuration",children:"Configuration"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#deploying-with-docker",children:"Deploying with Docker"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#hints",children:"Hints"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"#contact",children:"Contact"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"project-overview",children:"Project Overview"}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.strong,{children:"Baby Tools Shop"})," project is a Django-based web application that allows users to browse and purchase baby tools. The application is built with ",(0,s.jsx)(n.strong,{children:"Python"})," and ",(0,s.jsx)(n.strong,{children:"Django"})," and is designed to be easily containerized and deployed using ",(0,s.jsx)(n.strong,{children:"Docker"}),"."]}),"\n",(0,s.jsx)(n.h3,{id:"technologies",children:"Technologies"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Python 3.9"}),"\n",(0,s.jsx)(n.li,{children:"Django 4.0.2"}),"\n",(0,s.jsx)(n.li,{children:"Venv"}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"quickstart",children:"Quickstart"}),"\n",(0,s.jsx)(n.p,{children:"To get started with the Baby Tools Shop, follow these steps:"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Set up your Python environment:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"python -m venv your_environment_name\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Activate the virtual environment:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"your_environment_name\\Scripts\\activate\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Navigate to the project directory:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"cd babyshop_app\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Install Django:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"python -m pip install Django==4.0.2\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Go to the root directory and create a requirements.txt file:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:" cd ..\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:" nano requirements.txt\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Django==4.0.2"}),"\n",(0,s.jsx)(n.li,{children:"pillow==10.4.0"}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Apply migrations:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"python manage.py makemigrations\n"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:" python manage.py migrate\n"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Create a superuser:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:" python manage.py createsuperuser\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Important"}),": Use a DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL and a DJANGO_SUPERUSER_PASSWORD"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Run the development server:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:" python manage.py runserver\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["You can access the admin panel at ",(0,s.jsx)(n.code,{children:"http://<your_ip>:8000/admin"})]}),"\n",(0,s.jsx)(n.li,{children:"Create products in the admin panel"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Configure your environment:"}),"\r\nModify the ",(0,s.jsx)(n.strong,{children:"ALLOWED_HOSTS"})," setting in ",(0,s.jsx)(n.strong,{children:"settings.py"})," to include the domain names or IP addresses that will be used to access the application."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"ALLOWED_HOSTS = ['your_domain_or_ip']\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Configures allowed hosts: This setting specifies which domain names or IP addresses are permitted to access your Django application."}),"\n",(0,s.jsx)(n.li,{children:"Enhances security: It prevents HTTP Host header attacks by only allowing requests from specified hosts."}),"\n",(0,s.jsx)(n.li,{children:"Set for production: Replace 'your_domain_or_ip' with your actual domain or server IP to make your site accessible."}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Create Dockerfile:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:'# Use an official Python image as the base\r\nFROM python:3.9-slim\r\n\r\n# Set the working directory inside the container\r\n\r\nWORKDIR /app\r\n\r\n# Copy only the requirements file and install dependencies\r\n\r\nCOPY requirements.txt ${WORKDIR}\r\nRUN python -m pip install --no-cache-dir -r requirements.txt\r\n\r\n# Copy the code into the working direction\r\n\r\nCOPY . ${WORKDIR}\r\n\r\n# Change to the app directory and run database migrations\r\n\r\nWORKDIR /app/babyshop_app\r\nRUN python manage.py makemigrations && python manage.py migrate\r\n\r\nEXPOSE 8025\r\n\r\n# This is the command that will be executed on container launch\r\n\r\nENTRYPOINT ["sh", "-c", "python manage.py runserver 0.0.0.0:8025"]\n'})}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"deploying-with-docker",children:"Deploying with Docker"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Copy the Project Folder to your VM"})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Build the Docker image:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker build -t app_name .\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Builds a Docker image: This command creates a Docker image from the Dockerfile in the current directory."}),"\n",(0,s.jsx)(n.li,{children:"Tags the image: -t app_name assigns the tag app_name to the image, which can be used for easy reference."}),"\n",(0,s.jsx)(n.li,{children:"Prepares for deployment: The image contains the application and its dependencies, ready for running in a container."}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Create Docker volumes:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker volume create babyshop_db\r\ndocker volume create babyshop_media\r\ndocker volume create babyshop_static\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Create Docker volumes: These commands create named volumes that can be used to persist data across Docker container restarts and re-creations."}),"\n",(0,s.jsx)(n.li,{children:"babyshop_db: Volume for storing database data."}),"\n",(0,s.jsx)(n.li,{children:"babyshop_media: Volume for storing user-uploaded media files."}),"\n",(0,s.jsx)(n.li,{children:"babyshop_static: Volume for storing static files like CSS and JS."}),"\n",(0,s.jsx)(n.li,{children:"Ensures data persistence: Keeps your application data safe and accessible even if containers are removed or recreated."}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Run the Docker container:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker run -d --name app_name_container \\\r\n  -p 8025:8025 \\\r\n  -v babyshop_db:/app/babyshop_app/db \\\r\n  -v babyshop_media:/app/babyshop_app/media \\\r\n  -v babyshop_static:/app/babyshop_app/static \\\r\n  --restart on-failure \\\r\n  app_name\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Run a Docker container: This command starts a new container from the Docker image named app_name."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Detach mode (-d): Runs the container in the background."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Name the container (--name babyshop_app_container): Assigns the name babyshop_app_container to the running container for easier management."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Port mapping (-p 8025:8025): Maps port 8025 on the host to port 8025 in the container, making the app accessible via port 8025."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Mount volumes (-v):"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"babyshop_db:/app/babyshop_app/db: Maps the babyshop_db volume to the container\u2019s database directory."}),"\n",(0,s.jsx)(n.li,{children:"babyshop_media:/app/babyshop_app/media: Maps the babyshop_media volume to the container\u2019s media directory."}),"\n",(0,s.jsx)(n.li,{children:"babyshop_static:/app/babyshop_app/static: Maps the babyshop_static volume to the container\u2019s static files directory."}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Restart policy (--restart on-failure): Automatically restarts the container if it fails, but not if stopped manually."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["You can access your app at ",(0,s.jsx)(n.code,{children:"http://<vm_ip>:8025/"})]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Create a superuser"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker ps\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Shows active containers: Lists all running containers with their IDs and names."}),"\n",(0,s.jsx)(n.li,{children:"Identify your container: Find the container ID or name for your Django app."}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"docker exec -it <container_name_or_id> /bin/bash\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Execute a command inside a container: Opens an interactive terminal (-it) within the specified container."}),"\n",(0,s.jsxs)(n.li,{children:["Replace ",(0,s.jsx)(n.code,{children:"<container_name_or_id>"}),": Use the actual container name or ID from the previous command."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"python manage.py createsuperuser\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Run Django\u2019s superuser creation command: This will prompt you to enter"}),"\n",(0,s.jsx)(n.li,{children:"a DJANGO_SUPERUSER_USERNAME,"}),"\n",(0,s.jsx)(n.li,{children:"a DJANGO_SUPERUSER_EMAIL email"}),"\n",(0,s.jsx)(n.li,{children:"a DJANGO_SUPERUSER_PASSWORD password for the new superuser account."}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"exit\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Close the interactive session: Logs out of the container\u2019s shell and returns to your host machine's terminal."}),"\n",(0,s.jsxs)(n.li,{children:["You can access your app at ",(0,s.jsx)(n.code,{children:"http://<vm_ip>:8025/admin"})]}),"\n",(0,s.jsx)(n.li,{children:"Login with your superuser details"}),"\n",(0,s.jsx)(n.li,{children:"You can place products/ categories, get user rules and manage user rules"}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"hints",children:"Hints"}),"\n",(0,s.jsx)(n.p,{children:"This section will cover some hot tips when trying to interacting with this repository:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Settings & Configuration for Django can be found in ",(0,s.jsx)(n.code,{children:"babyshop_app/babyshop/settings.py"})]}),"\n",(0,s.jsxs)(n.li,{children:["Routing: Routing information, such as available routes can be found from any ",(0,s.jsx)(n.code,{children:"urls.py"})," file in ",(0,s.jsx)(n.code,{children:"babyshop_app"})," and corresponding subdirectories"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"example-photos",children:"Example Photos"}),"\n",(0,s.jsx)(n.h5,{id:"home-page-with-login",children:"Home Page with login"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Home Page with login",src:i(6127).A+"",title:"Home Page with login",width:"1897",height:"886"})}),"\n",(0,s.jsx)(n.h5,{id:"home-page-with-filter",children:"Home Page with filter"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Home Page with filter",src:i(1211).A+"",title:"Home Page with filter",width:"1913",height:"889"})}),"\n",(0,s.jsx)(n.h5,{id:"product-detail-page",children:"Product Detail Page"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Product Detail Page",src:i(2687).A+"",title:"Product Detail Page",width:"1891",height:"886"})}),"\n",(0,s.jsx)(n.h5,{id:"register-page",children:"Register Page"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Register Page",src:i(1902).A+"",title:"Register Page",width:"1909",height:"901"})}),"\n",(0,s.jsx)(n.h5,{id:"login-page",children:"Login Page"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Login Page",src:i(1290).A+"",title:"Login Page",width:"1907",height:"899"})}),"\n",(0,s.jsx)(n.h2,{id:"contact",children:"Contact"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Pascal Nehlsen - ",(0,s.jsx)(n.a,{href:"https://www.linkedin.com/in/pascal-nehlsen",children:"LinkedIn"})," - ",(0,s.jsx)(n.a,{href:"mailto:mail@pascal-nehlsen.de",children:"mail@pascal-nehlsen.de"})]}),"\n",(0,s.jsxs)(n.li,{children:["Project Link: ",(0,s.jsx)(n.a,{href:"https://github.com/PascalNehlsen/baby-tools-shop",children:"https://github.com/PascalNehlsen/baby-tools-shop"})]}),"\n"]})]})}function h(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},6127:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/all-products-6b58ffc720987096bdaf8618ecac5798.png"},2687:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/details-35c935c179705f16fad0b5d221aa5da0.png"},1211:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/filter-13148c28c2a68ff8d52e0499ff718fcb.png"},1290:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/login-d3fcc91f5a7ae1ab8feb5a0e70443ce3.png"},1902:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/register-41e253315a6dcea54a6abeed6bd666d2.png"},8453:(e,n,i)=>{i.d(n,{R:()=>o,x:()=>a});var s=i(6540);const r={},t=s.createContext(r);function o(e){const n=s.useContext(t);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),s.createElement(t.Provider,{value:n},e.children)}}}]);