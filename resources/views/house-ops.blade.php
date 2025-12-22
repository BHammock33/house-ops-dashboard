<!doctype html>
<html lang="en" data-user-id="{{ auth()->id() ?? 'guest' }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>House Ops</title>

  <meta name="csrf-token" content="{{ csrf_token() }}">

  <link rel="stylesheet" href="{{ secure_asset('house-ops-assets/style.css') }}" />
</head>
<body>
  <main class="wrap">
    <header class="hero" style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
  <div>
    <h1 id="siteTitle">Liebes Home Base</h1>
    <p class="sub" id="siteSubtitle"></p>
  </div>

  @auth
    <form method="POST" action="{{ route('logout') }}" style="margin:0;">
      @csrf
      <button
        type="submit"
        class="icon-btn"
        style="padding:6px 10px; font-size:12px; line-height:1; white-space:nowrap;"
        aria-label="Log out"
        title="Log out"
      >
        Logout
      </button>
    </form>
  @endauth
</header>

    <section class="grid">
        <section class="card quick-links">
     <h2>
      Quick links
     </h2>
     <ul id="linksList">
     </ul>
     <div class="hint">
     
     </div>
     <div class="quick-links-actions">
      <details class="links-chip" id="linksManager">
       <summary class="icon-btn">
        Edit
       </summary>
       <div class="links-panel">
        <div style="margin-top: 12px; display: grid; gap: 10px;">
         <label>
          <div class="meta">
           Page title
          </div>
          <input id="inputTitle" placeholder="Home Base" type="text"/>
         </label>
         <label>
          <div class="meta">
           Subtitle
          </div>
          <input id="inputSubtitle" placeholder="A tiny personal homepage..." type="text"/>
         </label>
         <div class="meta" style="margin-top: 6px;">
          Add a link
         </div>
         <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
          <input id="newLinkLabel" placeholder="Label (e.g., Calendar)" type="text"/>
          <input id="newLinkUrl" placeholder="URL (e.g., https://calendar.google.com)" type="text"/>
          <button class="icon-btn" id="btnAddLink" type="button">
           Add
          </button>
         </div>
         <p class="hint">
          Links are editable and removable above. This section just adds new ones.
         </p>
        </div>
       </div>
      </details>
      <details class="links-chip" id="exportManager">
       <summary class="icon-btn">
        Export/Print
       </summary>
       <div class="links-panel">
        <p class="hint">
         Export is a &ldquo;just in case.&rdquo; Print is a &ldquo;put it on the fridge.&rdquo;
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
         <button class="icon-btn" id="btnExport" type="button">
          Export JSON
         </button>
         <label class="icon-btn" style="display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">
          Import JSON
          <input accept="application/json" id="fileImport" style="display:none;" type="file"/>
         </label>
         <button class="icon-btn" id="btnReset" type="button">
          Reset
         </button>
         <button class="icon-btn" id="btnPrint" type="button">
          Print
         </button>
        </div>
       </div>
      </details>
     </div>
    </section>

      <section class="card col-6">
        <h2>Projects</h2>
        <p class="hint">First say to yourself what you would be; and then do what you have to do</p>
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

      <section class="card col-6">
        <h2>This week</h2>
        <p class="hint">Reset every Monday</p>

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
      <section class="card" id="golfCard">
  <h2>Golf rounds</h2>
  <p class="hint">Track course, cost, score, rating, and golf partner.</p>
  <button type="button" class="icon-btn" id="btnAddGolfRound">Add round</button>

  <div class="golf-add" id="golfAdd">
    <div class="golf-add-top">
      <label class="golf-field">
        <span class="meta">Golf course</span>
        <input id="golfCourse" type="text" placeholder="Mountain Shadows" />
      </label>

      <label class="golf-field">
        <span class="meta">Price per round</span>
        <input id="golfPrice" type="number" min="0" step="0.01" placeholder="45.00" />
      </label>

      <div class="golf-partner">
        <div class="meta">Second golfer</div>

        <div class="segmented" id="golfPartnerToggle">
          <input type="radio" name="golfPartner" id="golfPartnerMaddie" value="maddie" checked />
          <label for="golfPartnerMaddie">Maddie</label>

          <input type="radio" name="golfPartner" id="golfPartnerBoys" value="boys" />
          <label for="golfPartnerBoys">The Boys</label>
        </div>
      </div>
    </div>

    <div class="golf-entry">
      <div class="golf-entry-head">
        <div class="meta">Golfer</div>
        <div class="meta">Score</div>
        <div class="meta">Rating</div>
      </div>

      <div class="golf-entry-row">
        <div class="golf-name">Jack</div>
        <input id="golfScoreJack" type="number" inputmode="numeric" placeholder="89" />
        <input id="golfRatingJack" type="number" min="1" max="10" step="1" placeholder="8" />
      </div>

      <div class="golf-entry-row" id="golfRowMaddie">
        <div class="golf-name">Maddie</div>
        <input id="golfScoreMaddie" type="number" inputmode="numeric" placeholder="82" />
        <input id="golfRatingMaddie" type="number" min="1" max="10" step="1" placeholder="9" />
      </div>

      <div class="golf-entry-row" id="golfRowBoys">
        <div class="golf-name">The Boys</div>
        <input id="golfScoreBoys" type="number" inputmode="numeric" placeholder="101" />
        <input id="golfRatingBoys" type="number" min="1" max="10" step="1" placeholder="7" />
      </div>
    </div>

    <div class="golf-add-actions">
      <button type="button" class="icon-btn" id="btnSaveGolfRound">Save round</button>
    </div>
  </div>

  <ul id="golfRoundsList" class="golf-rounds"></ul>
</section>



    
      <section class="card">
        <h2>Meal picker</h2>
        <p class="hint">Decision fatigue is real. Let the machine choose.</p>

        <div class="card" style="margin-top: 12px;">
          <div class="title" id="pickedMealTitle">No pick yet.</div>
          <div class="meta" id="pickedMealIngredients"></div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button type="button" class="icon-btn" id="btnPickMeal">Pick a meal</button>
            <button type="button" class="icon-btn" id="btnCopyMeal">Copy ingredients</button>
            <span class="hint" id="mealHint" style="align-self: center;"></span>
          </div>
        </div>

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

        
      </section>

      <section class="card">
        <h2>House notes</h2>
        <p class="hint">Shutoffs, filter sizes, paint codes, contractor notes, the weird stuff your future self will forget.</p>
        <textarea id="houseNotes" rows="6" placeholder="Write the boring but important stuff here."></textarea>
      </section>

    </section>

    <footer class="footer">
      <p>The System is only as good as we are. Merry Christmas! Bennett Hammock&trade;</p>
    </footer>
  </main>

  <script type="module" src="{{ secure_asset('house-ops-assets/js/main.js') }}"></script>
</body>
</html>


