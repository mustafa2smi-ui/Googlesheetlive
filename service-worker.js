const CACHE_NAME = 'micnews-cache-v1';

// ✅ वो फ़ाइलें जो पहली बार में कैश करनी हैं (ऑफ़लाइन चलाने के लिए ज़रूरी)
const urlsToCache = [
  // मुख्य फ़ाइलें
  '/micnews123/index.html',  // अपनी HTML फ़ाइल का नाम
  '/micnews123/manifest.json',
  '/micnews123/service-worker.js',

  // इमेजेज और Icons (अगर आपने ये फ़ाइलें अपलोड की हैं)
  '/micnews123/favicon.png', 
  '/micnews123/images/og-image.jpg', 
  
  // Static Pages (अगर ये आपके प्रोजेक्ट के रूट में हैं)
  '/micnews123/About.html',
  '/micnews123/Privacy.html',
  '/micnews123/Term.html',
  '/micnews123/Disclaimer.html',
  '/micnews123/Contact.html'
];

// 🔴 महत्वपूर्ण नोट: ऊपर दिए गए सभी पाथ्स को अपने GitHub Pages के पाथ के अनुसार बदल दें!

// ----------------------------------------------------
// 1. Install Event: फ़ाइलों को कैश करें
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and added static assets');
        return cache.addAll(urlsToCache);
      })
  );
});

// ----------------------------------------------------
// 2. Fetch Event: नेटवर्क रिक्वेस्ट को मैनेज करें
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 🔹 Google Sheet Data (Network First, Cache Fallback नहीं)
  // यह सुनिश्चित करता है कि Google Sheet का डेटा हमेशा ताज़ा (लाइव) हो, 
  // अगर ऑफ़लाइन है तो डेटा "Loading..." दिखाएगा।
  if (requestUrl.hostname === 'docs.google.com' || requestUrl.hostname === 'www.google.com') {
    return; // Google Sheet request को सीधे नेटवर्क पर जाने दें
  }

  // 🔹 Static Files (Cache First, Network Fallback)
  // इससे आपकी वेबसाइट की डिज़ाइन (HTML, CSS, JS, Images) ऑफ़लाइन भी दिखती है।
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache में फ़ाइल मिली
        if (response) {
          return response;
        }
        // Cache में फ़ाइल नहीं मिली, नेटवर्क से लाओ
        return fetch(event.request).catch(() => {
          // अगर नेटवर्क भी फ़ेल है, तो कुछ नहीं लौटाना
          console.log('Fetch failed, no cache match.');
        });
      })
  );
});

// ----------------------------------------------------
// 3. Activate Event: पुराने कैश को साफ़ करें
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
