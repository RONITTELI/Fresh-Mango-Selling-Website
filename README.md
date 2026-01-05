# DevgadHapus - Premium Mango Delivery Platform

A production-ready e-commerce platform for mango delivery with real-time order tracking, admin management, and secure Firebase integration.

## 🎯 Features

### Customer Features
- ✅ Browse & filter mangoes by variety & weight
- ✅ Bilingual support (English & Marathi)
- ✅ Secure email/password authentication
- ✅ Shopping cart with persistent storage
- ✅ Checkout with address & phone validation (Mumbai pincode: 400XXX)
- ✅ Real-time order tracking (Pending → Confirmed → Rejected)
- ✅ Admin messaging on orders
- ✅ Complete order history

### Admin Features
- ✅ Dashboard with order overview
- ✅ Confirm/Reject orders with customer messaging
- ✅ User management (promote to admin, suspend accounts)
- ✅ Real-time order updates
- ✅ Role-based access control

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Backend**: Firebase (Auth + Realtime Database)
- **State Management**: React Context API + React Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Package Manager**: Bun / npm

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- Firebase project account
- Git

### Installation

```bash
# Clone & navigate
cd devgad-hapus-delights-main

# Install dependencies
npm install
# or
bun install

# Copy environment template
cp .env.example .env.local

# Edit with your Firebase credentials
nano .env.local  # or edit in your IDE
```

### Environment Variables (.env.local)

Get these from Firebase Console → Project Settings → Web App config:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX  # optional
VITE_ADMIN_EMAILS=ronitteli1@gmail.com,your-email@example.com
```

## 🚀 Development

```bash
# Start dev server (opens http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── Index.tsx           # Home & product showcase
│   ├── AuthPage.tsx        # Login & registration
│   ├── CartPage.tsx        # Shopping cart
│   ├── CheckoutPage.tsx    # Order placement & success
│   ├── UserOrdersPage.tsx  # Customer order history
│   ├── AdminPage.tsx       # Admin dashboard
│   └── NotFound.tsx        # 404 page
├── components/
│   ├── Header.tsx          # Navigation bar
│   ├── Footer.tsx          # Footer
│   ├── RouteGuards.tsx     # Auth middleware (RequireAuth, RequireAdmin)
│   ├── Hero.tsx, ProductsSection.tsx, AboutSection.tsx
│   └── ui/                 # Shadcn UI components
├── contexts/
│   ├── AuthContext.tsx     # User auth state
│   ├── CartContext.tsx     # Shopping cart state
│   └── LanguageContext.tsx # Language (EN/MR) state
├── lib/
│   ├── firebase.ts         # Firebase init & exports
│   └── utils.ts            # Utility functions
├── data/
│   └── mangoes.ts          # Product catalog
└── App.tsx                 # Route configuration
```

## 🔐 Security & Firebase Setup

### 1. Firebase Authentication
- Enable **Email/Password** auth in Firebase Console
- Add authorized domains:
  - `localhost` (dev)
  - `127.0.0.1` (dev)
  - Your production domain

### 2. Firebase Database Rules
Deploy these rules in Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "orders": {
      ".indexOn": ["createdAt", "status", "userId"],
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$id": {
        ".read": "auth != null && auth.uid == root.child('users').child($id).child('uid').val()",
        ".write": "auth != null && auth.uid == root.child('users').child($id).child('uid').val()"
      }
    },
    "userRoles": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && (auth.uid == $uid || root.child('userRoles').child(auth.uid).child('admin').val() === true)"
      }
    }
  }
}
```

### 3. Admin Setup
1. Create first admin user in Firebase Auth
2. Set `VITE_ADMIN_EMAILS=admin@example.com` in `.env.local`
3. Manually set role in Firebase Console:
   - Go to Realtime Database → `userRoles` → `{userId}` → add `admin: true`
4. Future admins can be promoted via `/admin` panel (Users tab)

## 📊 Key Features Explained

### User Authentication
- Sign up: Email + password (min 6 chars)
- Phone validation: 10 digits, starts with 6-9
- Pincode validation: Mumbai only (400XXX)
- Account suspension: Admins can suspend users (blocks all access)

### Orders & Messaging
- Customers place orders → status = "pending"
- Admin confirms/rejects with optional message
- Customers see status + all admin messages on `/orders`
- Real-time updates via Firebase listeners

### Role-Based Access
- **Guest**: Browse home page only
- **User**: Checkout, place orders, view order history
- **Admin**: Access `/admin` dashboard, manage users & orders
- **Suspended**: Redirected to home, can't access protected routes

## 🧪 Testing Checklist

Before deploying, test:

1. **Auth Flow**
   - [ ] Register with valid details
   - [ ] Login with correct credentials
   - [ ] Login fails with wrong password
   - [ ] Logout works

2. **Shopping**
   - [ ] Add items to cart
   - [ ] Adjust quantities
   - [ ] Remove items
   - [ ] Checkout shows order summary

3. **Orders**
   - [ ] Order placed → success screen with Order ID
   - [ ] Admin Panel shows pending order
   - [ ] Admin confirms → order status changes
   - [ ] Customer sees order on `/orders` page

4. **Messaging**
   - [ ] Admin sends message to order
   - [ ] Customer sees message on order details
   - [ ] Timestamp & sender visible

5. **Admin Panel**
   - [ ] Only admin email can access `/admin`
   - [ ] Can promote/suspend users
   - [ ] Suspended users can't login

## 🚢 Production Deployment

See [PRODUCTION.md](./PRODUCTION.md) for detailed deployment guides:
- Vercel (recommended)
- Netlify
- Docker
- Security headers setup
- Performance optimization

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts`
- **Products**: Edit `src/data/mangoes.ts`
- **Languages**: Update `src/contexts/LanguageContext.tsx`
- **Validation**: Modify `src/pages/AuthPage.tsx` (phone, pincode regex)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Orders not showing | Check user is logged in, verify Firebase rules, restart dev server |
| Login fails | Ensure Email/Password enabled in Firebase, add localhost to authorized domains |
| Admin panel empty | Is your email in VITE_ADMIN_EMAILS? Restart dev server |
| "Missing env var" error | Run `npm run dev` again, ensure `.env.local` has all keys |

## 📝 License

© 2025 DevgadHapus. All rights reserved.

## 🎓 Production Status

✅ Security hardened  
✅ Firebase rules configured  
✅ Role-based access implemented  
✅ Error handling & logging  
✅ Bilingual support  
✅ Mobile responsive  
✅ Ready for deployment

---

**Questions?** Contact: admin@mangosdelivery.com

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
#   F r e s h - M a n g o - S e l l i n g - W e b s i t e  
 