# Error Handling - Developer's Quick Reference

## Common Issues & Error Messages Covered

### 1️⃣ Input Validation Errors
These errors occur **before** any API calls are made.

| Issue | Error Title | Error Message | User Tip |
|-------|------------|---------------|----------|
| No dates selected | 📅 Date Selection Required | "Please select both a start date and an end date..." | N/A |
| Start > End date | ⚠️ Invalid Date Range | "Your start date cannot be after your end date..." | Check your dates |
| End date in future | 🚀 Future Dates Not Available | "The date range you selected includes dates in the future..." | Keep looking ahead, we just don't have those galaxy images yet |

### 2️⃣ Network & API Errors
These occur during API requests.

| HTTP Status | Error Title | Message | Tip |
|-------------|-----------|---------|-----|
| 503 | ❌ Error Loading Images | "Service Unavailable: The NASA API is currently unavailable..." | Try again in a few minutes |
| 429 | ❌ Error Loading Images | "Too Many Requests: The API rate limit has been reached..." | Wait before retrying |
| 404 | ❌ Error Loading Images | "Not Found: The NASA API endpoint could not be found..." | Contact support |
| 5xx (other) | ❌ Error Loading Images | "Server Error ({status}): The NASA servers are experiencing issues..." | Try again later |
| Network Down | ❌ Error Loading Images | "Network Error: Unable to connect to NASA's servers..." | Check internet connection |
| Invalid JSON | ❌ Error Loading Images | "Data Error: The server returned invalid data..." | Check browser console |

### 3️⃣ Data Validation Errors
These occur after API calls succeed but no matching data is found.

| Issue | Error Title | Error Message | User Tip |
|-------|------------|---------------|----------|
| No images in range | 🔍 No Images Found | "No images were found for the date range you selected..." | Try recent dates |

---

## Code Examples

### Catching Date Validation Errors
```javascript
// In button click handler (line ~31 in script.js)
if (!startDate || !endDate) {
  gallery.innerHTML = `
    <div class="error-container">
      <p class="error-title">📅 Date Selection Required</p>
      <p class="error-message">Please select both...</p>
    </div>
  `;
  return;
}

if (startDate > endDate) {
  gallery.innerHTML = `
    <div class="error-container">
      <p class="error-title">⚠️ Invalid Date Range</p>
      <p class="error-message">Your start date cannot...</p>
    </div>
  `;
  return;
}
```

### Catching API Errors
```javascript
// In fetchAPODImages function (line ~125)
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 503) {
      fetchError = 'Service Unavailable: The NASA API...';
    } else if (response.status === 429) {
      fetchError = 'Too Many Requests: The API rate limit...';
    }
    // ... more error handling
    throw new Error(fetchError);
  }
} catch (fetchErr) {
  if (fetchErr instanceof TypeError && fetchErr.message.includes('fetch')) {
    fetchError = 'Network Error: Unable to connect...';
  }
  throw new Error(fetchError);
}
```

### Displaying Errors
```javascript
// In catch block (line ~190)
gallery.innerHTML = `
  <div class="error-container">
    <p class="error-title">${errorTitle}</p>
    <p class="error-message">${errorDetails}</p>
    <p class="error-subtext">${errorTip}</p>
  </div>
`;
```

---

## CSS Classes Reference

### Main Container
```css
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(255, 240, 245, 0.8), ...);
  border: 2px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  max-width: 600px;
}
```

### Title
```css
.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #dc3545;  /* Red */
  margin-bottom: 15px;
}
```

### Message
```css
.error-message {
  font-size: 16px;
  color: #333333;
  margin-bottom: 15px;
  line-height: 1.6;
  font-weight: 500;
}
```

### Tip Text
```css
.error-subtext {
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
  font-style: italic;
}
```

---

## Adding New Error Types

To add a new error message:

1. **In JavaScript** (js/script.js):
   - Add validation logic or error catching
   - Set appropriate `errorTitle`, `errorDetails`, and `errorTip`
   - Display using the error-container template

2. **In CSS** (style.css):
   - Use existing `.error-container`, `.error-title`, `.error-message`, `.error-subtext` classes
   - No new classes needed unless you want custom styling

3. **Example**:
   ```javascript
   if (someNewCondition) {
     gallery.innerHTML = `
       <div class="error-container">
         <p class="error-title">📌 Custom Error Title</p>
         <p class="error-message">Custom error details here</p>
         <p class="error-subtext">💡 Tip: Helpful suggestion for user</p>
       </div>
     `;
     return;
   }
   ```

---

## Dark Mode Support

All error messages automatically adapt to night mode via these CSS rules:

```css
body.night-mode .error-container {
  background: linear-gradient(135deg, rgba(60, 20, 20, 0.8), ...);
  border-color: rgba(220, 53, 69, 0.5);
}

body.night-mode .error-title {
  color: #ff6b7a;  /* Brighter red for dark backgrounds */
}

body.night-mode .error-message {
  color: #e0e0e0;  /* Light gray text */
}

body.night-mode .error-subtext {
  color: #b0b0b0;  /* Medium gray text */
}
```

No special handling needed in JavaScript - just use the same classes!

---

## Testing Checklist

- [ ] Missing date selection triggers error
- [ ] Invalid date range (start > end) triggers error
- [ ] Network offline triggers network error
- [ ] API unavailable (503) triggers service unavailable error
- [ ] Rate limit (429) triggers rate limit error
- [ ] No results (empty date range) triggers "no images" error
- [ ] Error messages display correctly in light mode
- [ ] Error messages display correctly in dark mode
- [ ] Error tips are specific and helpful
- [ ] Browser console still shows full error details for debugging

---

## Browser Compatibility

✅ Works in all modern browsers:
- Chrome/Edge (Chromium) ✓
- Firefox ✓
- Safari ✓
- Mobile browsers ✓

Relies on:
- CSS Grid/Flexbox (supported since 2015)
- CSS Gradients (supported since 2010)
- CSS Backdrop Filter (supported in modern browsers)
- JavaScript template literals (ES6)
- Fetch API (supported since 2015)

