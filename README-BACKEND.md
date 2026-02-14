# BookIA - Real Backend Implementation

## 🚀 What's New

The AI Booking Assistant now has a fully functional backend! Instead of hardcoded mock data, the booking system now uses:

- **Real database** (Supabase/PostgreSQL)
- **Live API endpoints** for services, staff, availability, and bookings
- **Actual booking creation** with unique references
- **Email confirmation system** (ready for SMTP configuration)
- **Conflict detection** and availability checking
- **Multi-staff support** with specialties

## 📁 New Backend Structure

```
/app/api/
├── services/route.ts          # GET /api/services - List all services
├── staff/route.ts             # GET /api/staff - List all staff members  
├── availability/route.ts      # GET /api/availability - Check time slots
├── bookings/route.ts          # POST /api/bookings - Create booking
└── email-confirmation/route.ts # POST /api/email-confirmation - Send emails

/lib/
├── supabase.ts               # Database client configuration
├── types.ts                  # TypeScript interfaces
└── api.ts                    # Frontend API utilities

supabase-schema.sql           # Complete database schema
.env.example                  # Environment variables template
```

## 🗄️ Database Schema

The Supabase schema includes:

### Core Tables
- **services**: Available services (coupe, coloration, etc.)
- **staff**: Stylists/employees with specialties
- **customers**: Customer information
- **bookings**: Appointment records with status tracking
- **availability**: Staff working schedules by day of week
- **blocked_times**: Holidays, breaks, unavailable periods

### Features
- **UUID primary keys** for security
- **Booking references** (e.g., BK20260214001)
- **Availability checking** function to prevent conflicts
- **Email tracking** for confirmations and reminders
- **Staff-service relationships** (who can do what)
- **Automatic timestamps** and update triggers

### Sample Data
Pre-populated with salon data matching the original frontend:
- 6 services (coupe femme, coloration, mèches, etc.)
- 3 staff members (Marie, Julien, Sophie) 
- Working schedules (Tue-Sat, 9AM-6PM)
- Service specialties per staff member

## 🔧 Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema: `supabase-schema.sql` in the SQL editor
3. Get your project URL and API keys from Settings → API

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional for email confirmations
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Install Dependencies
The following packages are now included:
```bash
npm install @supabase/supabase-js nodemailer @types/nodemailer
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔄 API Endpoints

### GET /api/services
Returns list of available services with pricing and duration.

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": "uuid",
      "code": "coupe",
      "name": "Coupe femme", 
      "duration": "45 min",
      "price": "55$",
      "icon": "✂️"
    }
  ]
}
```

### GET /api/staff
Returns list of staff members with their specialties.

**Response:**
```json
{
  "success": true,
  "staff": [
    {
      "id": "uuid",
      "code": "marie",
      "name": "Marie L.",
      "specialty": "Coloriste",
      "avatar_emoji": "👩‍🎨",
      "services": [...]
    }
  ]
}
```

### GET /api/availability
Check available time slots for a service/staff/date combination.

**Parameters:**
- `serviceCode`: Service identifier (required)
- `staffCode`: Staff identifier (optional, "any" for no preference)
- `date`: Date in YYYY-MM-DD format (required)

**Response:**
```json
{
  "success": true,
  "timeSlots": [
    {
      "time": "09:00",
      "available": true,
      "staff_id": "uuid"
    }
  ]
}
```

### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "serviceCode": "coupe",
  "staffCode": "marie",  // or null for "any"
  "date": "2026-02-20",
  "time": "14:00",
  "customerName": "Marie Tremblay",
  "customerEmail": "marie@example.com",
  "customerPhone": "(514) 555-0123"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "booking_reference": "BK20260220001",
    "customer_name": "Marie Tremblay",
    "service": {...},
    "assigned_staff": {...},
    "booking_date": "2026-02-20",
    "booking_time": "14:00",
    "status": "confirmed"
  }
}
```

### POST /api/email-confirmation
Send confirmation/reminder emails.

**Request Body:**
```json
{
  "bookingId": "uuid",
  "type": "confirmation"  // or "reminder_24h", "reminder_1h"
}
```

## ✨ Frontend Changes

### Real Data Integration
- **Services**: Loaded from `/api/services` instead of `SERVICES` constant
- **Staff**: Loaded from `/api/staff` instead of `STYLISTS` constant  
- **Time Slots**: Dynamically generated from `/api/availability` based on actual staff schedules
- **Booking**: Real booking creation with database storage

### Enhanced UX
- **Loading states** during API calls
- **Error handling** with user-friendly messages
- **Real booking confirmations** with booking references
- **Email notifications** (when configured)
- **Form validation** for required fields

### API Integration
- `lib/api.ts` provides typed functions for all backend calls
- Error handling with try/catch and user feedback
- Loading indicators during database operations
- Real booking references and confirmation emails

## 📧 Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" (not your regular password)
3. Set environment variables:
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```

### Email Templates
Pre-built templates for:
- **Booking confirmation** with all details
- **24-hour reminder** before appointment
- **1-hour reminder** before appointment
- French-language content with business branding

## 🔄 Working Booking Flow

1. **Select Service**: Fetches real services from database
2. **Choose Staff**: Shows actual staff with their specialties
3. **Pick Date/Time**: Checks real availability against staff schedules and existing bookings
4. **Confirm Details**: Validates inputs and creates customer record
5. **Create Booking**: Generates unique booking reference, stores in database
6. **Send Confirmation**: Email confirmation sent (if configured)
7. **Success**: Shows booking reference and next steps

## 🚦 Status & Next Steps

### ✅ Completed
- Complete database schema with sample data
- All API endpoints functional
- Frontend integration with real data
- Email confirmation system foundation
- Error handling and loading states
- Booking conflict prevention
- Staff availability checking

### 🔜 Future Enhancements
- SMS reminders (Twilio integration)
- Payment processing (Stripe integration) 
- Admin dashboard for managing bookings
- Calendar integrations (Google Calendar, Outlook)
- Multi-location support
- Advanced recurring availability rules
- Customer booking history
- No-show tracking and penalties

## 🛠️ Development Notes

### Database Functions
- `generate_booking_reference()`: Creates unique booking IDs
- `is_staff_available()`: Checks for scheduling conflicts
- Auto-updating timestamps on all tables

### Security Considerations
- Row Level Security (RLS) ready for multi-tenant setup
- Service role key used for admin operations
- Input validation on all API endpoints
- Unique constraint enforcement

### Performance Optimizations
- Database indexes on frequently queried columns
- Efficient availability checking with single query
- Minimal data transfer with selective API responses

---

## 🎯 Result

**The booking system is now fully functional!** Users can:
- Browse real services from the database
- See actual staff members and their specialties
- Check real-time availability based on staff schedules
- Create bookings that are stored in the database
- Receive email confirmations (when configured)
- Get unique booking references for their appointments

The transition from mock data to a real backend is complete, providing a solid foundation for a production booking system.