# Real-time Counter Setup Guide

BaseGenesis menggunakan **dual-source strategy** untuk real-time counter:

## 🔥 Option 1: Firebase Realtime Database (Recommended)

**Keuntungan:**
- ✅ Instant real-time updates (< 100ms latency)
- ✅ Gratis untuk usage rendah
- ✅ Reliable dan scalable

**Setup:**

1. Buat Firebase project di [Firebase Console](https://console.firebase.google.com/)
2. Enable **Realtime Database** (bukan Firestore)
3. Set database rules:
   ```json
   {
     "rules": {
       "stats": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
4. Copy credentials ke `.env`:
   ```bash
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

5. Deploy ke Vercel dan tambahkan environment variables yang sama

---

## 📊 Option 2: Supabase Realtime (Fallback)

**Keuntungan:**
- ✅ Sudah integrated dengan database utama
- ✅ Tidak perlu service tambahan

**Kelemahan:**
- ⚠️ Slower updates (~1-3s latency)
- ⚠️ Perlu enable realtime di Supabase dashboard

**Setup:**

1. Jalankan migration SQL di Supabase SQL Editor:
   ```bash
   # File: supabase-migration-realtime-counter.sql
   ```

2. Enable Realtime di Supabase Dashboard:
   - Go to **Database** → **Replication**
   - Enable `global_stats` table
   - Atau jalankan SQL:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE global_stats;
     ```

3. Pastikan environment variables sudah di-set:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

---

## 🧪 Testing Real-time Updates

1. **Open browser console** untuk melihat logs:
   ```
   ✅ Using Firebase for real-time counter
   🔥 Firebase real-time update: 123
   ```
   atau
   ```
   ⚠️ Firebase unavailable, using Supabase for counter
   📊 Supabase real-time update: 45
   ```

2. **Test dengan 2 browser tabs:**
   - Tab 1: Scan wallet
   - Tab 2: Counter harus auto-update dalam 1-3 detik

3. **Check Firebase console:**
   - Path: `/stats/totalScans`
   - Value harus increment setiap scan

---

## 🐛 Troubleshooting

### Counter tidak update real-time

**Cek console logs:**
```javascript
// Jika Firebase not configured:
⚠️ Firebase unavailable, using Supabase for counter

// Jika Supabase realtime failed:
📊 Polling update: 45  // Fallback to polling every 10s
```

**Solusi:**
1. Pastikan Firebase credentials benar di Vercel
2. Restart Vercel deployment setelah add env vars
3. Check Firebase database rules (harus allow write)
4. Enable Supabase realtime replication

### Counter stuck di angka tertentu

**Kemungkinan:**
- Firebase/Supabase credentials missing
- Real-time subscription failed

**Solusi:**
- Hook akan fallback ke **polling mode** (update setiap 10 detik)
- Check browser console untuk error messages

---

## 📌 Strategi Fallback

Hook `useRealtimeScanCount` menggunakan **cascading fallback**:

```
1. Try Firebase Realtime DB
   ↓ (if failed)
2. Try Supabase Realtime
   ↓ (if failed)
3. Use Polling (every 10s)
   ↓ (if failed)
4. Show initial count (static)
```

Jadi counter akan **selalu berfungsi**, meskipun tidak real-time.

---

## 🚀 Recommendation

Untuk production, **gunakan Firebase**:
- Setup hanya 5 menit
- Free tier: 100k concurrent connections
- Latency < 100ms (vs Supabase ~1-3s)
- No polling needed (saves bandwidth)
