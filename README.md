# 🏪 Local Market Online Store

A full-stack e-commerce platform empowering local vendors to bring their businesses online.

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router |
| Backend  | PHP Laravel 10, JWT Auth |
| Database | MongoDB |
| Charts   | Recharts |
| Animations | Framer Motion |
| Icons    | React Icons |

## Project Structure

```
PHP_PROJECT/
├── backend/          # Laravel REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Auth, Product, Order, Vendor, Admin...
│   │   │   ├── Middleware/    # JWT, Role guards
│   │   ├── Models/            # MongoDB Models
│   ├── config/
│   ├── routes/api.php
│   ├── database/seeders/
│   └── composer.json
└── frontend/         # React SPA
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Route pages
    │   │   ├── auth/          # Login, Register, ForgotPassword
    │   │   ├── customer/      # Products, Cart, Orders, Wishlist...
    │   │   ├── vendor/        # Dashboard, Products, Orders, Analytics
    │   │   └── admin/         # Dashboard, Users, Vendors, Products...
    │   ├── context/           # Auth, Theme contexts
    │   ├── store/             # Redux store, slices
    │   ├── services/          # Axios API services
    │   └── utils/             # Helpers
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+
- MongoDB (local or Atlas)
- MongoDB PHP extension

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:
```env
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=local_market
```

### 3. Generate JWT Secret

```bash
php artisan jwt:secret
```

### 4. Seed the Database

```bash
php artisan db:seed
```

This creates:
- Admin: `admin@localmarket.com` / `password123`
- Vendor: `ramesh@vendor.com` / `password123`
- Vendor: `priya@vendor.com` / `password123`
- Sample products, categories, and coupons

### 5. Start the Backend

```bash
php artisan serve --port=8000
```

The API will be available at `http://localhost:8000/api`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

### Authentication

| Method | Endpoint                  | Description           | Auth |
|--------|---------------------------|-----------------------|------|
| POST   | /api/auth/register        | Register user/vendor  | No   |
| POST   | /api/auth/login           | Login                 | No   |
| POST   | /api/auth/logout          | Logout                | Yes  |
| GET    | /api/auth/me              | Get current user      | Yes  |
| PUT    | /api/auth/profile         | Update profile        | Yes  |
| POST   | /api/auth/change-password | Change password       | Yes  |

### Products

| Method | Endpoint                      | Description             | Auth     |
|--------|-------------------------------|-------------------------|----------|
| GET    | /api/products                 | List products (filters) | No       |
| GET    | /api/products/{id}            | Get product detail      | No       |
| GET    | /api/products/featured        | Featured products       | No       |
| GET    | /api/products/trending        | Trending products       | No       |
| POST   | /api/vendor/products          | Create product          | Vendor   |
| PUT    | /api/vendor/products/{id}     | Update product          | Vendor   |
| DELETE | /api/vendor/products/{id}     | Delete product          | Vendor   |

### Orders

| Method | Endpoint                        | Description         | Auth     |
|--------|---------------------------------|---------------------|----------|
| GET    | /api/orders                     | Customer orders     | Customer |
| POST   | /api/orders                     | Place order         | Customer |
| POST   | /api/orders/{id}/cancel         | Cancel order        | Customer |
| GET    | /api/vendor/orders              | Vendor orders       | Vendor   |
| PUT    | /api/vendor/orders/{id}/status  | Update status       | Vendor   |

### Cart

| Method | Endpoint            | Description       | Auth |
|--------|---------------------|-------------------|------|
| GET    | /api/cart           | Get cart          | Yes  |
| POST   | /api/cart/add       | Add item          | Yes  |
| PUT    | /api/cart/item/{id} | Update quantity   | Yes  |
| DELETE | /api/cart/item/{id} | Remove item       | Yes  |
| POST   | /api/cart/coupon    | Apply coupon      | Yes  |

### Admin

| Method | Endpoint                        | Description           | Auth  |
|--------|---------------------------------|-----------------------|-------|
| GET    | /api/admin/dashboard            | Dashboard stats       | Admin |
| GET    | /api/admin/users                | List users            | Admin |
| PUT    | /api/admin/vendors/{id}/approve | Approve vendor        | Admin |
| PUT    | /api/admin/products/{id}/approve| Approve product       | Admin |
| POST   | /api/admin/coupons              | Create coupon         | Admin |

## User Roles

### Customer
- Browse products with advanced filters
- Add to cart & wishlist
- Place and track orders
- Write product reviews
- Manage profile

### Vendor
- Create and manage digital storefront
- CRUD products with images
- View and update order status (Pending → Confirmed → Shipped → Delivered)
- Sales analytics with charts
- Best-sellers report

### Admin
- Approve/reject vendor registrations
- Moderate products
- Manage categories
- Create discount coupons
- View revenue analytics

## Demo Accounts

| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@localmarket.com    | password123 |
| Vendor  | ramesh@vendor.com        | password123 |
| Vendor  | priya@vendor.com         | password123 |

## Sample Coupons

| Code       | Discount            | Min Order |
|------------|---------------------|-----------|
| WELCOME10  | 10% off (max ₹100)  | ₹200      |
| FLAT50     | ₹50 flat off        | ₹300      |

## MongoDB Collections

- `users` — Customers, Vendors, Admins
- `vendors` — Vendor shop profiles
- `products` — Product listings
- `orders` — Customer orders
- `reviews` — Product reviews
- `carts` — Shopping carts
- `categories` — Product categories
- `coupons` — Discount codes
- `notifications` — User notifications

## Features

### Customer Features
✅ Product search with filters (category, price, location, rating)
✅ Product detail page with reviews and similar products
✅ Shopping cart with quantity control
✅ Wishlist management
✅ Coupon/discount codes
✅ Order placement with address and payment method selection
✅ Order tracking with status timeline
✅ Order history and detail
✅ Profile management
✅ Review and rating system

### Vendor Features
✅ Dedicated vendor dashboard
✅ Product CRUD with image URLs
✅ Order management with status updates
✅ Monthly sales chart
✅ Best-sellers analytics
✅ Store profile management

### Admin Features
✅ Platform-wide analytics
✅ User management (ban/unban/delete)
✅ Vendor approval workflow
✅ Product moderation
✅ Category management
✅ Coupon creation and management
✅ Revenue reports (daily/monthly)

## Production Deployment

### Backend (PHP/Laravel)

1. Set `APP_ENV=production` and `APP_DEBUG=false`
2. Configure MongoDB Atlas connection string
3. Run `composer install --optimize-autoloader`
4. Configure web server (Nginx/Apache) to point to `public/`
5. Set proper CORS origins

### Frontend (React)

```bash
npm run build
```

Serve the `dist/` folder via:
- Nginx static hosting
- Vercel / Netlify (recommended)
- Firebase Hosting

Update `VITE_API_URL` to your production API URL.

### Environment Variables for Production

Backend `.env`:
```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=<mongodb-atlas-url>
JWT_SECRET=<strong-random-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary>
STRIPE_SECRET=<your-stripe-secret>
```

Frontend `.env`:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Security Features

- JWT token-based authentication
- Role-based access control (Customer/Vendor/Admin)
- Password hashing with bcrypt
- CORS protection
- Input validation on all endpoints
- Rate limiting ready
- XSS protection via Blade escaping

## License

MIT License - Free to use and modify
