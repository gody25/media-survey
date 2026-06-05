const SUPABASE_URL = "https://dpuuciqpwvnqztlfziyp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwdXVjaXFwd3ZucXp0bGZ6aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDMwNTUsImV4cCI6MjA5NjIxOTA1NX0.WPEYIjShMIOLd7Skc-K_BzXJmW7rIh2TKwO430ZUC0Y";

const PAGE_SIZE = 8;

const OPTIONS = {
  genders: ["Laki-laki", "Perempuan", "Lainnya"],
  platforms: ["Instagram", "TikTok", "YouTube", "Facebook", "X / Twitter", "WhatsApp", "LinkedIn", "Telegram", "Lainnya"],
  durations: ["< 1 jam", "1-2 jam", "3-4 jam", "5-6 jam", "> 6 jam"],
  purposes: ["Komunikasi", "Hiburan", "Belajar", "Berita / Informasi", "Bisnis / Promosi", "Networking", "Lainnya"],
  frequencies: ["Jarang", "Beberapa kali seminggu", "Setiap hari", "Beberapa kali sehari", "Hampir setiap saat"],
  benefits: ["Sangat membantu", "Membantu", "Cukup membantu", "Kurang membantu", "Tidak membantu"],
  productivity: ["Sangat mengganggu", "Mengganggu", "Netral", "Tidak mengganggu", "Meningkatkan produktivitas"],
  impacts: ["Very Positive", "Positive", "Neutral", "Negative", "Very Negative"]
};