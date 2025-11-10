# Chat App 🚀

A real-time private chat application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.io**.  
This app allows users to **signup/login, chat in real-time, share images**, and manage their profiles.

---

## Features ✨

- **User Authentication** (Signup/Login) with JWT
- **Real-time Chat** with Socket.io
- **Send Text & Images** to users
- **Profile Management** (update profile picture, bio)
- **Online/Offline User Tracking**
- **Unseen Message Notifications**
- Responsive design with **TailwindCSS**
- Optimized for modern web browsers

---

## Tech Stack 🛠️

| Frontend        | Backend       | Database  | Others                             |
|-----------------|---------------|----------|-----------------------------------|
| React.js        | Node.js       | MongoDB  | Socket.io                         |
| React Router    | Express       | Mongoose | Cloudinary (Image Upload)         |
| TailwindCSS     | JWT Auth      |          | Axios                             |
| React Context API |             |          | React Hot Toast                   |

---

## Getting Started 🏃‍♂️

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**

2. **Install dependencies**
- Frontend
```
cd client
npm install
```

- Backend
```
cd ../server
npm install
```

3. **Create .env files**
- Client (client/.env)
```
VITE_BACKEND_URL=http://localhost:5000
```

# Server (server/.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Deployment 🌐

The frontend and backend can be deployed on **Vercel** or any cloud hosting platform.  

## Screenshots 🖼️

### Chat UI
![Chat UI](client/src/assets/screenshots/login-signup.png)

### Profile Page
![Profile Page](client/src/assets/screenshots/home.png)

### Media Sharing
![Media Sharing](client/src/assets/screenshots/chat.png)

## Live Demo 🌐

Check out the app here: [Chat App Live Demo](https://chat-app-psi-silk.vercel.app)

