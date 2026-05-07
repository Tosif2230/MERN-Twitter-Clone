# 🎬 MERN-Twitter-Clone

A full-stack **Twitter Clone** application built using the **MERN Stack (MongoDB, Express, React, Node.js)**.
This project replicates core Twitter features along with **advanced real-world constraints, security mechanisms, and premium features**.

---

## 👨‍💻 Developer

Mohammed Tosif
Full Stack Developer (MERN)

Live Demo:
https://mern-twitter-clone-lime.vercel.app/

---

## 🚀 Project Objective

The objective of this project is to develop a **real-world full-stack web application** that demonstrates:

* Firebase Authentication
* RESTful API design with Express
* State management
* Modern React UI with reusable components
* Clean, scalable project architecture
* Advanced feature implementation with real-world constraints

---

## 🧩 Tech Stack

### Frontend

* React (Next.js)
* TypeScript
* Tailwind CSS
* Axios
* i18next
* i18next-browser-languagedetector
* Lucide-react
* Shadcn UI
* Firebase
* React-Toastify

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JSON Web Token (jsonwebtoken)
* Twilio (OTP services)
* ua-parser-js (device & browser detection)
* CORS
* Nodemon
* Cloudinary
* Nodemailer
* Multer
* Razorpay

---

## ✨ Features

### 👤 User Authentication

* User registration and login
* Firebase authentication
* Persistent login using localStorage

---

## 🔔 Smart Notification System

* Uses Browser Notification API
* Triggers notifications for keywords: **cricket, science**
* Shows full tweet content
* Toggle ON/OFF from profile

---

## 🎙️ Audio Tweet Feature

* Record/upload audio tweets

**Security:**

* OTP via email before upload

**Limits:**

* Max duration: 5 minutes
* Max size: 100MB

**Time Window:**

* 2:00 PM – 7:00 PM IST

---

## 🔐 Forgot Password

* Reset via email or phone (if email not received check spam folder)
* Only 1 request per day

**Message:**
"You can use this option only one time per day."

**Password Generator:**

* Uppercase + lowercase only

---

## 💳 Subscription Plans

| Plan   | Price | Tweets    |
| ------ | ----- | --------- |
| Free   | ₹0    | 1         |
| Bronze | ₹100  | 3         |
| Silver | ₹300  | 5         |
| Gold   | ₹1000 | Unlimited |

* Razorpay integration
* Invoice email after payment

**Payment Time:**

* 10:00 AM – 11:00 AM IST

---

## 🌍 Multi-Language Support

Languages:

* English, Spanish, Hindi, Portuguese, Chinese, French

**Verification:**

* French → Email OTP (if email not received check spam folder)
* Others → Mobile OTP (Twilio)

---

## 🛡️ Login Security

Tracks:

* Browser (ua-parser-js)
* OS
* Device
* IP

Visible in profile.

---

## 📱 Responsiveness

* Mobile, Tablet, Desktop supported

---

## ▶️ Run Project

Backend:

```bash
cd Backend
npm install
npm start
```

Frontend:

```bash
cd Frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Frontend:

```
NEXT_PUBLIC_BACKEND_URL=your backend localhost or Rander link
NEXT_PUBLIC_FIREBASE_API_KEY=your firebase API key
```

Backend:

```
PORT=5050
MONGODB_URL=mongoDB URI

MAIL_USER=your mail id 
MAIL_PASS=your mail app password

TWILIO_ACCOUNT_SID=your twilio sid
TWILIO_AUTH_TOKEN=your twilio token
TWILIO_PHONE_NUMBER=your twilio purchesed phone number

CLOUDINARY_CLOUD_NAME=your cloudinary account name
CLOUDINARY_API_KEY=your cloudinary API key
CLOUDINARY_API_SECRET=your cloudinary secret key

RAZORPAY_KEY_ID=your account test id
RAZORPAY_KEY_SECRET=your account secret key
```

---
 ## Details for Razor pay 
```
CARD : 5267 3181 8797 5449
EXPIRY : any future date (e.g., 12/30)
CVV : any 3 digit
OTP : any 6 digit
```
---

## ⭐ Support

Give this repo a star ⭐ if you like it!
