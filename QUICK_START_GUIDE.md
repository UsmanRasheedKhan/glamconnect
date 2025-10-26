# 🚀 GlamConnect - Quick Start Guide

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd glamconnect
npm install
```

### Step 2: Start the Development Server
```bash
npm start
```
This opens the app at `http://localhost:3000`

### Step 3: Login or Create an Account
- Fill in the signup form with:
  - Full Name
  - Email
  - Phone Number
  - Password
- Click "Sign Up"
- You're now logged in! 🎉

---

## 📱 App Navigation

After login, use the navbar to navigate:

| Page | Path | What You Do |
|------|------|-----------|
| 🏠 Home | /home | View welcome page with featured services |
| 🛍️ Services | /services | Browse all 12 services and book |
| 📅 My Bookings | /profile | View and manage your bookings |
| ℹ️ About Us | /about | Learn about the salon |
| 🖼️ Gallery | /gallery | View service photos (filterable) |
| 📞 Contact | /contact | Contact info and form |

---

## 💅 How to Book a Service

1. **Click "Services" in the navbar**
   - See all 12 services displayed in a grid
   - Each service shows name, price, duration

2. **Click "Book Now" on any service**
   - Modal pops up with service details
   - See price, duration, description

3. **Select a Date**
   - Click date picker
   - Choose any future date

4. **Select a Time**
   - Click time dropdown
   - Choose a 30-minute slot (10:00 - 17:30)

5. **Click "Confirm"**
   - ✅ Success message appears
   - Modal closes
   - Booking is saved

6. **View Your Booking**
   - Click profile icon → go to /profile
   - Scroll to "My Bookings" section
   - See all your scheduled services

---

## 📋 Services Available

### 💇 Hair Services (3)
- Basic Haircut - $30 (30 min)
- Hair Coloring - $75 (2 hrs)
- Hair Styling - $50 (1 hr)

### 💅 Nail Services (3)
- Manicure - $25 (45 min)
- Pedicure - $30 (1 hr)
- Nail Art - $40 (1 hr)

### 💄 Makeup Services (2)
- Makeup Application - $60 (1 hr)
- Bridal Makeup - $120 (2 hrs)

### 🧖 Facial Services (2)
- Facial Treatment - $55 (1 hr)
- Deep Cleansing - $75 (1.5 hrs)

### 💆 Massage Services (2)
- Full Body Massage - $80 (1 hr)
- Head & Neck Massage - $45 (45 min)

---

## 🎯 Profile Features

### View Your Information
- Your name and email displayed
- Account type (customer)
- Edit profile button (coming soon)

### My Bookings Section
- See all confirmed bookings
- Each booking shows:
  - Service name
  - Date and time
  - Duration
  - Price
  - "Cancel" button

### Cancel a Booking
1. Go to /profile
2. Find the booking you want to cancel
3. Click "Cancel Booking" button
4. Confirm in dialog
5. Booking is removed

### Logout
1. Click profile icon in navbar
2. Click "Logout" button
3. Redirected to login page

---

## 🎨 Explore the Salon

### About Us Page
- Company story (founded 2020)
- Mission and vision
- Core values
- Meet the team (4 stylists)
- Why choose us (6 reasons)

### Gallery Page
- 16 photos of services
- Browse by category:
  - Hair (4 photos)
  - Nails (4 photos)
  - Makeup (4 photos)
  - Facials (2 photos)
  - Massage (2 photos)
- Salon stats (5000+ happy clients, etc.)

### Contact Us Page
- Contact form (send a message)
- Address and phone number
- Email addresses
- Business hours
- Social media links
- Map placeholder

---

## ✨ Key Features Explained

### 🔒 Login Protection
- Services, bookings, gallery all require login
- Non-logged-in users auto-redirected to login page
- This is intentional for security

### 📱 Responsive Design
- **Desktop**: Full layout with all features
- **Tablet**: Optimized for medium screens
- **Mobile**: Hamburger menu, stacked layout

### 💾 Booking Storage
- All bookings saved in your browser
- Persist even after closing the app
- Only cleared if you clear browser cache
- Switch browsers = bookings on new browser don't show (each browser has its own storage)

### 🎯 Auto-Redirects
- Login successful → redirect to /home
- Try to access services without login → redirect to login
- Logout → redirect to login page

### ✅ Form Validation
- Contact form checks all fields filled
- Date picker prevents past dates
- Time validation ensures valid time selected
- All inputs validated before saving

---

## 🐛 Troubleshooting

### Q: I can't see the Services page
**A**: Make sure you're logged in first. Services page requires authentication.

### Q: My bookings disappeared!
**A**: Bookings are stored in browser localStorage. Clearing cache removes them.

### Q: I can book past dates
**A**: The date picker should prevent this. Try a different browser if it's not working.

### Q: Why can't I edit my profile?
**A**: Edit profile is a placeholder for future feature development.

### Q: The website shows errors in console
**A**: Check that:
- You're running `npm start`
- No typos in code
- All dependencies installed (`npm install`)

### Q: Booking not showing on /profile
**A**: Try:
1. Refresh the page
2. Check browser console for errors
3. Make sure date picker has min date set to today

---

## 🔗 Important Links

- **Frontend Server**: http://localhost:3000
- **Backend API**: https://glamconnect.infinityfree.me/glamconnect/api.php
- **Project Docs**: See `PROJECT_COMPLETION_SUMMARY.md`
- **Booking System**: See `BOOKING_SYSTEM_DOCS.md`

---

## 📁 File Structure Quick Reference

```
glamconnect/
├── src/
│   ├── components/
│   │   ├── Navbar.js (top navigation bar)
│   │   └── Navbar.css
│   ├── pages/ (main website pages)
│   │   ├── HomePage.js
│   │   ├── Services.js (book services here)
│   │   ├── AboutUs.js
│   │   ├── Gallery.js
│   │   └── ContactUs.js
│   ├── screens/
│   │   ├── Auth.js (login/signup)
│   │   └── Home.js (user profile + bookings)
│   └── App.js (routing configuration)
├── public/ (HTML, manifest, etc.)
└── package.json
```

---

## 💡 Pro Tips

1. **Use Chrome DevTools** (F12) to inspect:
   - localStorage data (Application → localStorage)
   - Bookings stored there
   - User token

2. **Test with Multiple Bookings**
   - Create 3-4 bookings to see list
   - Cancel some to see updates
   - Great way to test the system

3. **Check Responsive Design**
   - Open Chrome DevTools → Toggle device toolbar
   - Try different screen sizes
   - Mobile menu (hamburger) appears at smaller sizes

4. **Form Validation Testing**
   - Try Contact form without filling fields
   - Try booking without selecting date/time
   - Should show validation messages

5. **Booking Date Limits**
   - Bookings show times from 10:00 AM - 5:30 PM
   - 30-minute intervals (10:00, 10:30, 11:00, etc.)
   - To add more times, edit Services.js generateTimeSlots()

---

## 🎓 Learning Resources

All code includes **beginner-friendly comments** explaining:
- React hooks (useState, useEffect)
- localStorage usage
- Event handling
- Form submission
- Component structure
- CSS properties

Perfect for learning React fundamentals!

---

## 🚀 Next Steps

1. ✅ Run `npm start` - start development server
2. ✅ Signup/Login - create an account
3. ✅ Explore Pages - visit all pages
4. ✅ Book Service - complete a full booking
5. ✅ View Bookings - see your bookings in profile
6. ✅ Cancel Booking - test cancellation
7. ✅ Logout - test authentication flow
8. ✅ Deploy - host on Infinity Free or Vercel (when ready)

---

## 📞 Support

### Having Issues?
1. Check console for errors (F12)
2. Check localStorage (F12 → Application)
3. Try refreshing the page
4. Clear browser cache and try again
5. Check file paths in imports

### Want to Extend?
- Edit services in `Services.js`
- Add more pages in `pages/` folder
- Modify styling in `.css` files
- Add new routes in `App.js`

---

## ✨ Enjoy!

Your GlamConnect salon website is ready to use. Book services, manage your profile, and explore the salon. Have fun! 🎉

**Happy coding! 💻**
