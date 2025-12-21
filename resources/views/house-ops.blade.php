<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>House Ops</title>

  <meta name="csrf-token" content="{{ csrf_token() }}">

  <link rel="stylesheet" href="{{ asset('house-ops-assets/style.css') }}" />
</head>
<body>
  {{-- Paste the dashboard HTML body content here (from your index.html) --}}
  {{-- Keep the existing element IDs; the JS depends on them. --}}
    <main class="wrap">
    <header class="hero">
      <h1>Home Base</h1>
      <p class="sub">
        A tiny personal homepage. A place to put links, notes, and “future me will thank me” stuff.
      </p>
    </header>

    <section class="card">
      <h2>Quick links</h2>
      <ul>
        <li><a href="https://calendar.google.com/">Calendar</a></li>
        <li><a href="https://drive.google.com/">Drive</a></li>
        <li><a href="https://docs.google.com/">Docs</a></li>
        <li><a href="https://www.bitwarden.com/">Password manager</a></li>
      </ul>
      <p class="hint">Edit this list to match your life. You own this page.</p>
    </section>

    <section class="grid">
      <div class="card">
        <h2>House notes</h2>
        <p>
          Put the boring-but-important stuff here: shutoff locations, paint colors, filter sizes, contractor notes.
        </p>
      </div>

      <div class="card">
        <h2>Projects</h2>
        <p>
          A running list of “next weekend” projects. Keep it short. The goal is momentum, not guilt.
        </p>
      </div>

      <div class="card">
        <h2>Reading queue</h2>
        <p>
          Books, articles, and long reads you actually want to finish.
        </p>
      </div>
    </section>

    <footer class="footer">
      <p>Built with plain HTML + CSS. No framework. No drama.</p>
    </footer>
  </main>
  <script src="{{ asset('house-ops-assets/app.js') }}"></script>
</body>
</html>
