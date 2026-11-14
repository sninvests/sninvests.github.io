/* ------------------------------------------------------------------
   S N Investments: site settings.
   Edit this file only. Anything left empty ("") is hidden on the site.
   ------------------------------------------------------------------ */
window.SN_CONFIG = {
  // --- Business details (REQUIRED before going live) ---
  phone: "+91 92058 32288",            // display number, e.g. "+91 98765 43210"
  whatsapp: "919205832288",         // digits only with country code, e.g. "919876543210". Enquiry form sends here.
  email: "Nadeem@sninvests.co.in",            // e.g. "hello@sninvestments.in"
  address: "",          // full office address
  arn: "136834",              // AMFI Registration Number, e.g. "ARN-123456"
  arnValidTill: "",     // e.g. "31 Mar 2028"
  irdaiNote: "",        // optional: insurance registration / POSP / corporate agent details

  // --- Links ---
  loginUrl: "",         // client portal URL, if there is one
  schemeAnnexureUrl: "https://www.amfiindia.com/",   // replace with the annexure PDF or page
  social: [
    // { label: "Instagram", url: "https://instagram.com/..." },
    // { label: "YouTube", url: "https://youtube.com/@..." },
    // { label: "Facebook", url: "https://facebook.com/..." },
  ],

  // --- Hero background video (optional): "hero.mp4" ---
  heroVideo: "",

  // --- Video corner ---
  // Use youtubeId (the part after v=) to embed a YouTube video,
  // or file for your own MP4 in this folder (e.g. "intro.mp4"). "poster" is an optional image.
  // Cards with only "search" open a YouTube search until real videos are added.
  videos: [
    { title: "Why invest in mutual funds", search: "why invest in mutual funds explained" },
    { title: "Bachat Nivesh", search: "bachat nivesh mutual fund" },
    { title: "What is a mutual fund", search: "mutual funds sahi hai AMFI" },
  ],
};
