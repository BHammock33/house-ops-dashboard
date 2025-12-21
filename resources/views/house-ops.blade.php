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
  <main class="wrap">
    <header class="hero">
      <h1 id="siteTitle">Home Base</h1>
      <p class="sub" id="siteSubtitle"></p>
    </header>

    <section class="card">
      <h2>Quick links</h2>
      <ul id="linksList"></ul>

      <div class="hint">
        <button type="button" class="icon-btn" id="btnManageLinks">Manage links</button>
      </div>

      <details id="linksManager" class="card" style="margin-top: 12px;">
        <summary class="icon-btn" style="cursor: pointer;">Edit links and page title</summary>

        <div style="margin-top: 12px; display: grid; gap: 10px;">
          <label>
            <div class="meta">Page title</div>
            <input id="inputTitle" type="text" placeholder="Home Base" />
          </label>

          <label>
            <div class="meta">Subtitle</div>
            <input id="inputSubtitle" type="text" placeholder="A tiny personal homepage..." />
          </label>

          <div class="meta" style="margin-top: 6px;">Add a link</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
            <input id="newLinkLabel" type="text" placeholder="Label (e.g., Calendar)" />
            <input id="newLinkUrl" type="text" placeholder="URL (e.g., https://calendar.google.com)" />
            <button type="button" class="icon-btn" id="btnAddLink">Add</button>
          </div>

          <p class="hint">Links are editable and removable above. This section just adds new ones.</p>
        </div>
      </details>
    </section>

    <section class="grid">
      <section class="card">
        <h2>House notes</h2>
        <p class="hint">Shutoffs, filter sizes, paint codes, contractor notes, the weird stuff your future self will forget.</p>
        <textarea id="houseNotes" rows="6" placeholder="Write the boring but important stuff here."></textarea>
      </section>

      <section class="card">
        <h2>Projects</h2>
        <p class="hint">Keep it short. Momentum beats guilt.</p>
     <div class="row" style="align-items: end;">
  <label style="display: grid; gap: 6px; flex: 1 1 220px;">
    <span class="meta">Project</span>
    <input id="projectText" type="text" placeholder="Fix the leaky faucet" />
  </label>

  <label style="display: grid; gap: 6px; flex: 0 0 160px;">
    <span class="meta">Due</span>
    <input id="projectDue" type="date" />
  </label>

  <button type="button" class="icon-btn" id="btnAddProject">Add</button>
</div>
        <ul id="projectsList" style="margin-top: 12px;"></ul>
      </section>

      <section class="card">
        <h2>Reading queue</h2>
        <p class="hint">Articles, books, long reads. Add the link so you actually come back.</p>

        <div class="row" style="align-items: end;">
  <label style="display: grid; gap: 6px; flex: 1 1 220px;">
    <span class="meta">Title</span>
    <input id="readingTitle" type="text" placeholder="That one article I swear I’ll read" />
  </label>

  <label style="display: grid; gap: 6px; flex: 1 1 220px;">
    <span class="meta">URL</span>
    <input id="readingUrl" type="text" placeholder="https://..." />
  </label>

  <button type="button" class="icon-btn" id="btnAddReading">Add</button>
</div>


        <ul id="readingList" style="margin-top: 12px;"></ul>
      </section>
    </section>

    <section class="grid" style="margin-top: 16px;">
      <section class="card">
        <h2>Meal picker</h2>
        <p class="hint">Decision fatigue is real. Let the machine choose.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
          <label style="display: grid; gap: 6px;">
            <span class="meta">Meal name</span>
            <input id="mealName" type="text" placeholder="Salmon bowls" />
          </label>

          <label style="display: grid; gap: 6px;">
            <span class="meta">Ingredients</span>
            <input id="mealIngredients" type="text" placeholder="salmon, rice, cucumber, avocado..." />
          </label>

          <button type="button" class="icon-btn" id="btnAddMeal">Add</button>
        </div>

        <ul id="mealsList" style="margin-top: 12px;"></ul>

        <div class="card" style="margin-top: 12px;">
          <div class="title" id="pickedMealTitle">No pick yet.</div>
          <div class="meta" id="pickedMealIngredients"></div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button type="button" class="icon-btn" id="btnPickMeal">Pick a meal</button>
            <button type="button" class="icon-btn" id="btnCopyMeal">Copy ingredients</button>
            <span class="hint" id="mealHint" style="align-self: center;"></span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>This week</h2>
        <p class="hint">Reset every Monday. Low stakes. High usefulness.</p>

        <div class="weekly" id="weeklyList"></div>

        <details id="weeklyManager" style="margin-top: 12px;">
          <summary class="icon-btn" style="cursor: pointer;">Edit this week list</summary>

          <div style="margin-top: 12px; display: grid; gap: 10px;">
            <div class="meta">Add an item</div>
            <div class="row" style="align-items: end;">
              <label style="display: grid; gap: 6px; flex: 1 1 240px;">
                <span class="meta">Label</span>
                <input id="newWeeklyLabel" type="text" placeholder="Example: Trash night" />
              </label>
              <button type="button" class="icon-btn" id="btnAddWeekly">Add</button>
            </div>

            <div class="meta" style="margin-top: 8px;">Current items</div>
            <div id="weeklyItemsEditor" style="display: grid; gap: 8px;"></div>

            <p class="hint">These items persist. The checkmarks reset every Monday.</p>
          </div>
        </details>
      </section>

      <section class="card">
        <h2>Backup and printing</h2>
        <p class="hint">Export is a “just in case.” Print is a “put it on the fridge.”</p>

        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <button type="button" class="icon-btn" id="btnExport">Export JSON</button>

          <label class="icon-btn" style="display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">
            Import JSON
            <input id="fileImport" type="file" accept="application/json" style="display:none;" />
          </label>

          <button type="button" class="icon-btn" id="btnReset">Reset</button>
          <button type="button" class="icon-btn" id="btnPrint">Print</button>
        </div>
      </section>
    </section>

    <footer class="footer">
      <p>Built to be boring in the best way.</p>
    </footer>
  </main>

  <script type="module" src="{{ asset('house-ops-assets/js/main.js') }}"></script>
</body>
</html>

