# Lofi
An expense tracking application created using MERN stack with authentication and password recovery with OTP via email. User can register, login, reset password, and operate full CRUD methods to their own transaction list and customize their transaction category option. The data will be visualized into a column chart to provide a better view to user's monthly.

How to run this project locally
The client and the server need to be running at the same time. Make sure you have Node installed on your machine. Download Node at: https://nodejs.org/en .

Starting off by cloning the project
Go to the "server" directory:

  cd server

Install dependencies:

  npm install

Start the server:

  npm start

Then open another terminal and go to the "client" directory:

  cd client

Install dependencies:

  npm install

Start the client:

  npm start

 Create a server/config.js file. Input:
    JWT_SECRET
    EMAIL
    PASSWORD
    MONGO_URL
for the backend to work
