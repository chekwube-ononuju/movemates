# MoveMates – Student Moving Platform

MoveMates is a modern web application that connects students who need moving help with fellow students willing to lend a hand for a fee. It’s built with React, TypeScript, Supabase and Stripe.

## 🚀 Features

### For Job Posters
- **Create Moving Requests**: Post detailed moving jobs with location, date, and time
- **Flexible Pricing**: Choose between hourly rates or fixed pricing
- **Time Estimation**: Specify estimated hours needed for the job
- **Real-time Pricing Calculator**: See estimated total costs for hourly jobs
- **Interactive Map**: View and set job locations with real-world mapping
- **Geolocation Support**: Find your current location automatically

### For Movers/Helpers
- **Browse Available Jobs**: View all open moving requests on an interactive map
- **Detailed Job Information**: See job descriptions, pricing, and time estimates
- **Contact System**: Connect with job posters directly
- **Profile Management**: Build your helper profile and reputation

### Technical Features
- **Real-time Updates**: Live job postings and status updates
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Authentication**: Secure user authentication with Supabase

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Maps**: Leaflet with OpenStreetMap
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/college-move-helper.git
   cd college-move-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and provide the required credentials. These variables are used for local development:
   ```env
   # Supabase connection
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Stripe credentials (publishable key for the client)
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # When deploying on Vercel or another serverless platform, set a secret environment variable
   # called STRIPE_SECRET_KEY with your Stripe secret key. This is used by the API route at
   # api/create-payment-intent.js to create payment intents and add the 10% platform fee.
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
pnpm run dev
```

**To build**

```shell
pnpm run build
```
