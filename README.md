# 📺 HotIPTVMan - Premium IPTV Platform

A full-stack IPTV streaming platform built with **NestJS** (TypeScript) for the backend API and **React** (TypeScript) for the frontend.

## 🚀 Features

- **Modern Tech Stack**: NestJS + React + TypeScript
- **RESTful API**: Built with NestJS framework
- **Responsive UI**: Beautiful gradient design with category filtering
- **Real-time Channel Management**: Browse channels by category
- **API Health Monitoring**: Real-time API status display
- **CORS Configured**: Seamless frontend-backend communication

## 📋 Project Structure

```
hotiptvman/
├── api/                 # NestJS Backend API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── iptv/        # IPTV Module
│   │       ├── iptv.module.ts
│   │       ├── iptv.controller.ts
│   │       └── iptv.service.ts
│   ├── .env
│   └── package.json
│
├── client/              # React Frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── .env
│   └── package.json
│
└── package.json         # Root package with concurrent scripts
```

## 🛠️ Technology Stack

### Backend (API)

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Express** - HTTP server
- **RxJS** - Reactive programming

### Frontend (Client)

- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Axios** - HTTP client

## ⚙️ Configuration

### API Configuration

**Port**: 5000  
**Environment**: Development  
**CORS**: Enabled for `http://localhost:3000` and `hotiptvman.com`

Edit [`api/.env`](api/.env):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DOMAIN=hotiptvman.com
```

### Client Configuration

**Port**: 3000 (Vite default: 5173)  
**API URL**: http://localhost:5000

Edit [`client/.env`](client/.env):

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=HotIPTVMan
VITE_DOMAIN=hotiptvman.com
```

## 📦 Installation

### Install all dependencies at once:

```bash
npm run install:all
```

### Or install separately:

```bash
# Root dependencies
npm install

# API dependencies
cd api && npm install

# Client dependencies
cd client && npm install
```

## 🚀 Running the Application

### Run Both API and Client Together (Recommended):

```bash
npm run dev
```

This will start:

- 🔧 **API** on http://localhost:5000
- 🌐 **Client** on http://localhost:5173

### Run Separately:

#### API Only:

```bash
npm run api:dev
# or
cd api && npm run start:dev
```

#### Client Only:

```bash
npm run client:dev
# or
cd client && npm run dev
```

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

#### Health Check

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-31T...",
  "service": "HotIPTVMan API"
}
```

#### Get All Channels

```
GET /iptv/channels
```

#### Get Single Channel

```
GET /iptv/channels/:id
```

#### Get Categories

```
GET /iptv/categories
```

#### Create Playlist

```
POST /iptv/playlist
```

## 🎨 Frontend Features

- **Category Filtering**: Filter channels by News, Sports, Movies, etc.
- **Responsive Grid**: Adapts to all screen sizes
- **Real-time API Status**: Shows connection status to backend
- **Beautiful UI**: Modern gradient design with smooth animations
- **Channel Cards**: Display channel logos, names, and categories

## 🌐 Production Deployment

### Build for Production:

```bash
npm run build
```

This will:

1. Build the NestJS API to `api/dist/`
2. Build the React app to `client/dist/`

### Run Production Build:

```bash
# Start API
cd api && npm run start:prod

# Serve Client (use a static file server)
cd client && npx serve -s dist
```

## 🔧 Development

### API Development:

```bash
cd api
npm run start:dev    # Watch mode
npm run start:debug  # Debug mode
```

### Client Development:

```bash
cd client
npm run dev          # Development server
```

## 📝 Environment Variables

### API (.env)

- `PORT`: API server port
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS
- `DOMAIN`: Production domain

### Client (.env)

- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_DOMAIN`: Production domain

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC License

## 👨‍💻 Author

**HotIPTVMan Team**

---

**🌐 Domain**: hotiptvman.com  
**📺 Built with**: NestJS + React + TypeScript  
**🚀 Ready for**: Production deployment
