# Media Survey

Media Survey is a pure HTML5, CSS3, JavaScript, Bootstrap 5, Supabase, and Chart.js web application for collecting and managing social media usage survey responses.

## Folder Structure

```text
media-survey/
  index.html
  survey.html
  login.html
  README.md
  admin/
    dashboard.html
    responses.html
    statistics.html
  assets/
    css/
      style.css
    js/
      app.js
      auth.js
      config.js
      dashboard.js
      responses.js
      statistics.js
      supabaseClient.js
      survey.js
  supabase/
    schema.sql
```

## Supabase Setup

1. Create a new project at Supabase.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Open Authentication > Providers and keep Email enabled.
4. Open Authentication > Users and create an admin user with email and password.
5. Open Project Settings > API and copy:
   - Project URL
   - anon public key
6. Edit `assets/js/config.js`:

```js
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-public-key";
```

## Authentication

Admin login uses Supabase Auth email/password through `supabaseClient.auth.signInWithPassword`.

Protected pages call `requireAuth()` before loading data:

- `admin/dashboard.html`
- `admin/responses.html`
- `admin/statistics.html`

Logout uses `supabaseClient.auth.signOut()`.

## Database

Tables:

- `responden`: respondent profile data
- `jawaban_survei`: survey answers linked to `responden.id`

RLS policies in `supabase/schema.sql` allow:

- anonymous users to submit surveys
- authenticated users to read, update, and delete survey data
- anonymous users to read summary data for the public landing statistics preview

For stricter privacy, remove the two public SELECT policies noted in the SQL file. The landing preview will then be unavailable, while admin pages still work after login.

## Running The App

No build step is required.

Open `index.html` directly in a browser, or serve the folder with any static server. Because this project uses only CDN scripts and static files, it does not require Node.js, React, or Next.js.

## Pages

- `index.html`: public landing page with hero, about survey, and statistics preview
- `survey.html`: public survey form
- `login.html`: admin authentication
- `admin/dashboard.html`: cards for total respondents, male, female, popular platform, and recent responses
- `admin/responses.html`: CRUD management, search, pagination, platform filter, CSV export
- `admin/statistics.html`: Chart.js visual statistics

## CRUD Operations

- Create: `survey.html` inserts into `responden`, then inserts into `jawaban_survei`
- Read: admin pages query `jawaban_survei` joined with `responden`
- Update: `responses.html` updates both linked tables through the edit modal
- Delete: deleting a respondent cascades to its survey answer

## CSV Export

Open `admin/responses.html`, apply search/filter if desired, then click **Export CSV**. The export includes the filtered dataset.

## CDN Dependencies

- Bootstrap 5
- Bootstrap Icons
- Supabase JavaScript SDK v2
- Chart.js