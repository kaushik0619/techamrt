# TechMart - E-commerce Platform

A full-stack e-commerce application built with React, TypeScript, MongoDB, and Express.js.

## Features

- **User Authentication**: Register, login, and user management
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Processing**: Complete order workflow with checkout
- **Admin Dashboard**: Analytics and order management
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- MongoDB with native driver
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd mongo-project
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/techmart

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Port
PORT=3001
```

### 3. Database Setup

Start your MongoDB instance and run the seed script to populate sample data:

```bash
npm run seed
```

This will create sample products in your MongoDB database.

### 4. Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/sales-by-region` - Regional sales data
- `GET /api/admin/recent-orders` - Recent orders

## Project Structure

```
├── server/                 # Backend code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   └── seed.ts           # Database seeding
├── src/                   # Frontend code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   ├── contexts/         # React contexts
│   ├── lib/              # Utilities
│   └── App.tsx           # Main app component
└── package.json
```

## Development

### Adding New Features

1. **Backend**: Add new models in `server/models/`, routes in `server/routes/`
2. **Frontend**: Add new components in `src/components/` or pages in `src/pages/`
3. **API Integration**: Use the `api` utility in `src/lib/api.ts` for API calls

### Database Seeding

To add more sample data, modify `server/seed.ts` and run:

```bash
npm run seed
```

## Production Deployment

1. Build the frontend: `npm run build`
2. Set production environment variables
3. Start the server: `node server/index.js`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
