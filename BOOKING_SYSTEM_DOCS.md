# 📅 GlamConnect Booking System - Technical Documentation

## Overview
The GlamConnect booking system is a **frontend-centric solution** that uses React state management and browser localStorage to manage service bookings. No backend database is required for bookings (they persist in the browser until cleared).

---

## How Booking Flow Works

### Step 1: User Login
```
1. User navigates to / (login page)
2. User fills signup/login form
3. Credentials sent to backend (Infinity Free)
4. Token and user data stored in localStorage
5. User redirected to /home (HomePage)
6. Navbar appears globally on all pages
```

### Step 2: Browse Services
```
1. User clicks "Services" in navbar
2. Services page loads with grid of 12 services
3. Each service shows:
   - Emoji icon
   - Service name
   - Category (Hair/Nails/Makeup/Facials/Massage)
   - Description
   - Price ($25-$120)
   - Duration (30 min - 2 hrs)
   - "Book Now" button
```

### Step 3: Book a Service
```
1. User clicks "Book Now" on any service
2. Modal opens with:
   - Service details (name, price, duration, description)
   - Date picker input
   - Time selector dropdown
   - User info preview
   - Cancel/Confirm buttons
3. User selects future date
4. User selects time slot (10:00-17:30, 30-min intervals)
5. User clicks "Confirm"
6. Booking validated and saved to localStorage
7. Success alert shown
8. Modal closes
```

### Step 4: View Bookings
```
1. User clicks profile icon in navbar
2. Goes to /profile (user profile page)
3. "My Bookings" section shows all bookings
4. Each booking displays:
   - Service name
   - Date and time
   - Duration
   - Price
   - "Cancel" button
```

### Step 5: Cancel Booking
```
1. User clicks "Cancel Booking" on any booking
2. Confirmation dialog appears
3. If confirmed:
   - Booking removed from localStorage
   - Bookings list updates
   - Success message shown
```

---

## localStorage Structure

### Bookings Array
```javascript
// localStorage key: "bookings"
// Value: JSON array of booking objects

[
  {
    id: 1702500000000,           // Unique timestamp ID
    serviceId: 1,                // Service ID from hardcoded services
    serviceName: "Hair Coloring", // Service name
    price: 75,                   // Price in dollars
    date: "2024-12-25",          // Format: YYYY-MM-DD
    time: "14:00",               // Format: HH:MM (24-hour)
    duration: "2 hrs",           // Duration string
    bookedAt: 1702500000000      // Booking creation timestamp
  },
  {
    id: 1702600000000,
    serviceId: 3,
    serviceName: "Manicure",
    price: 25,
    date: "2024-12-26",
    time: "10:00",
    duration: "45 min",
    bookedAt: 1702600000000
  }
]
```

### User Data
```javascript
// localStorage key: "user"
// Value: JSON object

{
  name: "Amira Khan",
  email: "amira@example.com",
  contact: "+1-555-123-4567",
  role: "customer"
}
```

### Authentication Token
```javascript
// localStorage key: "token"
// Value: JWT token string

"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Service Data Structure

### Hardcoded Services (12 Total)
```javascript
const services = [
  // HAIR SERVICES (3)
  {
    id: 1,
    name: "Basic Haircut",
    category: "Hair",
    icon: "💇",
    price: 30,
    duration: "30 min",
    description: "Professional haircut with wash and styling"
  },
  {
    id: 2,
    name: "Hair Coloring",
    category: "Hair",
    icon: "💇‍♀️",
    price: 75,
    duration: "2 hrs",
    description: "Full hair coloring with premium products"
  },
  {
    id: 3,
    name: "Hair Styling",
    category: "Hair",
    icon: "💄",
    price: 50,
    duration: "1 hr",
    description: "Professional styling for special occasions"
  },

  // NAIL SERVICES (3)
  {
    id: 4,
    name: "Manicure",
    category: "Nails",
    icon: "💅",
    price: 25,
    duration: "45 min",
    description: "Nail care and polish application"
  },
  {
    id: 5,
    name: "Pedicure",
    category: "Nails",
    icon: "🦶",
    price: 30,
    duration: "1 hr",
    description: "Foot care and toe nail polish"
  },
  {
    id: 6,
    name: "Nail Art",
    category: "Nails",
    icon: "✨",
    price: 40,
    duration: "1 hr",
    description: "Creative nail art designs"
  },

  // MAKEUP SERVICES (2)
  {
    id: 7,
    name: "Makeup Application",
    category: "Makeup",
    icon: "💄",
    price: 60,
    duration: "1 hr",
    description: "Professional makeup application"
  },
  {
    id: 8,
    name: "Bridal Makeup",
    category: "Makeup",
    icon: "👰",
    price: 120,
    duration: "2 hrs",
    description: "Specialized bridal makeup service"
  },

  // FACIAL SERVICES (2)
  {
    id: 9,
    name: "Facial Treatment",
    category: "Facials",
    icon: "🧖",
    price: 55,
    duration: "1 hr",
    description: "Complete facial treatment"
  },
  {
    id: 10,
    name: "Deep Cleansing",
    category: "Facials",
    icon: "✨",
    price: 75,
    duration: "1.5 hrs",
    description: "Deep skin cleansing treatment"
  },

  // MASSAGE SERVICES (2)
  {
    id: 11,
    name: "Full Body Massage",
    category: "Massage",
    icon: "💆",
    price: 80,
    duration: "1 hr",
    description: "Relaxing full body massage"
  },
  {
    id: 12,
    name: "Head & Neck Massage",
    category: "Massage",
    icon: "🧖‍♀️",
    price: 45,
    duration: "45 min",
    description: "Targeted head and neck massage"
  }
]
```

---

## Key Code Sections

### Services.js - Booking Modal
```javascript
// Open modal when user clicks "Book Now"
const handleBookClick = (service) => {
  setSelectedService(service);
  setShowModal(true);
};

// Generate time slots (30-minute intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 10; hour <= 17; hour++) {
    for (let min of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

// Save booking to localStorage
const handleConfirmBooking = () => {
  const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  
  const newBooking = {
    id: Date.now(),
    serviceId: selectedService.id,
    serviceName: selectedService.name,
    price: selectedService.price,
    date: bookingData.date,
    time: bookingData.time,
    duration: selectedService.duration,
    bookedAt: Date.now()
  };
  
  existingBookings.push(newBooking);
  localStorage.setItem('bookings', JSON.stringify(existingBookings));
};
```

### Home.js - Display Bookings
```javascript
// Load bookings on component mount
useEffect(() => {
  const storedBookings = localStorage.getItem('bookings');
  if (storedBookings) {
    setBookings(JSON.parse(storedBookings));
  }
}, []);

// Cancel a booking
const handleCancelBooking = (bookingId) => {
  if (window.confirm('Are you sure you want to cancel?')) {
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  }
};
```

### App.js - Route Protection
```javascript
// Check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Services route (protected)
<Route
  path="/services"
  element={
    <ProtectedRoute>
      <Services />
    </ProtectedRoute>
  }
/>
```

---

## Data Flow Diagram

```
USER FLOW:
┌─────────┐
│ Login   │ ──> Token + User stored in localStorage
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Browse Services │ ──> Display all 12 services from hardcoded array
└────┬────────────┘
     │
     ▼
┌──────────────────────┐
│ Click "Book Now"     │ ──> Modal opens with service details
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Select Date & Time   │ ──> User picks future date + time slot
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Click "Confirm"      │ ──> Booking object created + saved to localStorage
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ View My Bookings     │ ──> Retrieve bookings from localStorage + display
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Cancel Booking       │ ──> Remove from localStorage array
└──────────────────────┘
```

---

## Booking Validation Rules

### Date Validation
- ✅ Must be today or in the future
- ✅ Cannot book for past dates
- ✅ Format: YYYY-MM-DD
- Code:
  ```javascript
  <input type="date" min={new Date().toISOString().split('T')[0]} />
  ```

### Time Validation
- ✅ Must select a time slot
- ✅ 30-minute intervals (10:00, 10:30, 11:00, ... 17:30)
- ✅ Cannot select empty time
- Code:
  ```javascript
  if (!bookingData.date || !bookingData.time) {
    alert('Please select both date and time');
    return;
  }
  ```

### Booking Object Validation
- ✅ Must have all required fields
- ✅ Price must be valid number
- ✅ Date must match YYYY-MM-DD format
- ✅ Time must match HH:MM format

---

## localStorage Limitations & Considerations

### Data Persistence
| Scenario | Result |
|----------|--------|
| User logs out | Bookings remain in localStorage |
| Clear browser cache | Bookings deleted |
| Close browser | Bookings remain |
| Logout from another tab | Bookings remain until cache clear |
| Switch browser/device | Bookings not visible (stored locally) |

### Storage Capacity
- **Limit**: ~5-10MB per origin (browser dependent)
- **Current Usage**: ~1KB per booking (very efficient)
- **Capacity**: Can store 5,000+ bookings safely

### Best Practices Implemented
- ✅ Always check if key exists before parsing
- ✅ Use JSON.parse() with default empty array
- ✅ Always JSON.stringify() before saving
- ✅ Confirm destructive actions (cancel booking)
- ✅ Show user feedback (success alerts)

---

## Testing the Booking System

### Test Case 1: Create Booking
1. Login to app
2. Navigate to Services page
3. Click "Book Now" on "Hair Coloring"
4. Select date: December 25, 2024
5. Select time: 14:00
6. Click "Confirm"
7. ✅ Should see success message
8. Navigate to Profile → My Bookings
9. ✅ Should see the booking listed

### Test Case 2: Cancel Booking
1. Go to Profile → My Bookings
2. Click "Cancel Booking" on any booking
3. Confirm in dialog
4. ✅ Booking should disappear from list
5. Open browser DevTools → Application → localStorage
6. ✅ Booking should be removed from array

### Test Case 3: Multiple Bookings
1. Create 3 different bookings
2. Go to Profile → My Bookings
3. ✅ All 3 should be displayed
4. Cancel 1 booking
5. ✅ 2 should remain

### Test Case 4: Date Validation
1. Go to Services
2. Click "Book Now"
3. Try to select past date
4. ✅ Should be disabled/greyed out
5. Select future date
6. ✅ Should allow selection

### Test Case 5: Protection
1. Logout from app
2. Try to access /services directly in URL
3. ✅ Should redirect to login page
4. Try to access /profile directly
5. ✅ Should redirect to login page

---

## Future Enhancement Ideas

1. **Backend Integration**
   - Store bookings in database instead of localStorage
   - Send confirmation emails
   - Allow users to modify bookings

2. **Calendar Integration**
   - Show salon availability
   - Block booked time slots
   - Show conflicts

3. **Notifications**
   - Email reminders before booking
   - SMS notifications
   - Browser notifications

4. **Admin Panel**
   - View all bookings
   - Manage service availability
   - Generate reports

5. **Payment System**
   - Accept online payments
   - Show payment status
   - Invoice generation

6. **User Reviews**
   - Leave reviews after service
   - Rate stylists
   - Review photos

---

## Troubleshooting

### Bookings not showing after refresh?
- **Cause**: localStorage was cleared
- **Solution**: Create a new booking - it will be saved

### Cannot book service without login?
- **Cause**: Services page is a protected route
- **Solution**: This is intentional! User must login first

### Booking appears in one browser but not another?
- **Cause**: localStorage is browser-specific
- **Solution**: This is normal. localStorage doesn't sync across browsers

### Date picker shows past dates?
- **Cause**: Date input validation not set
- **Solution**: Check that `min` attribute is set to today's date

### Cannot select time slot?
- **Cause**: Need to select date first
- **Solution**: The date must be selected before time becomes available

---

## Code Best Practices Used

✅ **State Management**: useState hooks for bookings
✅ **Side Effects**: useEffect for loading bookings
✅ **Navigation**: useNavigate for redirects
✅ **Data Validation**: Check all inputs before saving
✅ **Error Handling**: Try-catch blocks
✅ **User Feedback**: Alert messages for confirmation
✅ **Performance**: Efficient re-renders with proper dependencies
✅ **Security**: Protected routes for authenticated users
✅ **Code Quality**: Comprehensive comments throughout
✅ **Responsive Design**: Mobile-first CSS with breakpoints

---

**End of Technical Documentation** 📖
