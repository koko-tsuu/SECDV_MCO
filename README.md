# Discusso
This project is created to be a forum web application named Discusso. To run this application locally, you will need to install Node.js and the multiple dependencies used in this project.
Currently, MongoDB is connected to the Discusso database. If you want to change databases, you may need to edit the .env to reflect changes to your own local database.

## Installation
Download the latest version of NodeJS here (https://nodejs.org/en). It is preferred to download the recommended version.
Install with default settings.

To verify that you have already downloaded NodeJS, type this into your command prompt and it'll show you your current NodeJS version.
```bash
node -v
```

## Setup
Open your command prompt and navigate to the directory where you downloaded it. At the root folder, type the following to launch your local NodeJS server.
```bash
npm start
```

After confirming that the server is running, open your browser and type the following link.
```bash
http://localhost:3000/home
```

The site should now be displayed.

## Site Details
Although some features are available to a non-logged in user such as searching, sharing a post (copying the url), viewing a post/tag and other users' profiles, and seeing others' comments. A user must create an account first before being able to maximize the site features.  To register, an email, username (minimum of 4 characters and a maximum 20 characters), and a password must be given. After registering or logging in, the user is able to do the following:
* View a profile
* Edit profile
* Create a post
* Edit a post
* Delete a post
* Comment
* Edit comment
* Delete comment
* Reply to a comment
* Subscribe or unsubscribe to a tag
* Upvote a post or comment
* Downvote a post or comment
* Search a post, tag, or user
