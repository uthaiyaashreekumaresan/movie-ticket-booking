# TicketVibe Pudukkottai — Movie Ticket Booking Page

TicketNew Pudukkottai model-la create panna responsive online movie ticket booking frontend. Built strictly using **Plain HTML, CSS, and Vanilla JavaScript** with zero external runtime dependencies.

---

## 🚀 Epdi Open Panni Run Panrathu?

### Method 1 (Direct Double Click — Easiest):
1. Ungaloda computer-la intha file location-ku ponga:
   `C:\movie booking\ticketnew-pudukkottai\`
2. Ange irukkira **`index.html`** file-ah double-click pannunga.
3. Google Chrome, Edge, or ungalukku pidicha ethavathu browser-la direct-aa open aagi smooth-aa run aagum! (No npm install, no node commands required).

### Method 2 (Browser URL):
Browser address bar-la direct-aa enter pannalam:
```text
file:///C:/movie booking/ticketnew-pudukkottai/index.html
```

---

## 📝 Mock Data Enga Irukku? (How to Edit)

Intha application-la irukkira ella mock data-vum **`index.html`** file-la `<script>` tag-ku keezha line ~450-la irukkira **`const MOCK_DATA = { ... }`** object-la clearly organize pannirukku:

1. **Movies List** (`MOCK_DATA.movies`):
   - Movie Title, Certificate (UA 16+), Language (Tamil), Format (2D / 4K Laser Dolby Atmos), Genre, Duration, Rating, Synopsis, and Poster URL.
2. **Pudukkottai Theatres & Showtimes** (`MOCK_DATA.theatres`):
   - Real theatres in Pudukkottai:
     - *Sri Brinda Multiplex RGB 4K Laser*
     - *Shanthi Theatre A/C 2K Dolby Atmos*
     - *Bhuvaneswari Theatre 4K Digital*
     - *Siva Cinemas A/C Laser 3D*
   - Showtimes (10:30 AM, 02:15 PM, 06:30 PM, 10:00 PM) with status flags: `available`, `fast-filling`, `almost-full`.
3. **Seat Categories & Tiers** (`MOCK_DATA.tiers`):
   - **Elite Recliner**: ₹250 (Row A)
   - **Premium Balcony**: ₹180 (Rows B, C, D)
   - **First Class**: ₹120 (Rows E, F, G, H)
   - **Second Class**: ₹80 (Row J)
4. **Already Booked Seats** (`MOCK_DATA.bookedSeatIds`):
   - Sample sold-out seats array (`['A4', 'B7', 'C5', ...]`). Intha array-la seat IDs add/remove panni sold out status control pannikalam.

---

## ✨ Core Features & Flow

1. **Header & Location**:
   - TicketNew visual structure with location selector pre-set to **Pudukkottai**.
   - Search bar for quick movie & theatre filtering.
2. **Movie Header & Switcher**:
   - Movie poster, certificate, audio specs, user rating, and synopsis.
   - **"Switch Movie"** button to cycle between current Tamil blockbusters (*Amaran*, *GOAT*, *Kanguva*, *Vettaiyan*).
3. **Horizontal Date Strip**:
   - Today, Tomorrow, and next 4 upcoming dates with interactive active date toggle.
4. **Showtime Filters**:
   - All Shows, Morning (< 12 PM), Matinee (12 - 4 PM), Evening (4 - 7 PM), Night (> 7 PM).
5. **Interactive Seat Selection Layout**:
   - Curved cinema screen at the top (*"ALL EYES FACING HERE — SCREEN"*).
   - Aisle spacing between wings (Left wing, Center block, Right wing).
   - Available, Selected, and Sold Out states with distinct visual treatment.
   - Max 8 seats limit check.
   - Running live counter & total amount bar.
   - Full keyboard accessibility (Arrow keys, Tab, Enter/Space).
6. **Booking Summary & Digital M-Ticket**:
   - Movie, Theatre, Screen, Date, Showtime, and Selected Seat Badges.
   - Base fare + Convenience fee breakdown.
   - M-Ticket confirmation with QR Code and Print / Save PDF option.
