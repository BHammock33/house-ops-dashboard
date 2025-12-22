<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>House Ops</title>
<meta content="{{ csrf_token() }}" name="csrf-token"/>
<link href="{{ asset('house-ops-assets/style.css') }}" rel="stylesheet"/>
</head>
<body>
<main class="wrap">
<header class="hero">
<h1 id="siteTitle">Home Base</h1>
<p class="sub" id="siteSubtitle"></p>
</header>

<section class="grid"><section class="card col-12 quick-links">
<h2>Quick links</h2>
<ul id="linksList"></ul>
<div class="quick-links-actions">
<details id="linksManager" class="links-chip">
<summary class="icon-btn" >Edit links and page title</summary>
<div class="links-panel" style="margin-top: 12px; display: grid; gap: 10px;">
<label>
<div class="meta">Page title</div>
<input id="inputTitle" placeholder="Home Base" type="text"/>
</label>
<label>
<div class="meta">Subtitle</div>
<input id="inputSubtitle" placeholder="A tiny personal homepage..." type="text"/>
</label>
<div class="meta" style="margin-top: 6px;">Add a link</div>
<div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
<input id="newLinkLabel" placeholder="Label (e.g., Calendar)" type="text"/>
<input id="newLinkUrl" placeholder="URL (e.g., https://calendar.google.com)" type="text"/>
<button class="icon-btn" id="btnAddLink" type="button">Add</button>
</div>
<p class="hint">Links are editable and removable above. This section just adds new ones.</p>
</div>
</details><details id="exportManager" class="links-chip"><summary class="icon-btn" >Export or print this page</summary>
<div class="links-panel" style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 10px;"><button class="icon-btn" id="btnExport" type="button">Export JSON</button><label class="icon-btn" style="display: inline-flex; align-items: center; gap: 10px; cursor: pointer;">Import JSON<input accept="application/json" id="fileImport" style="display:none;" type="file"/></label><button class="icon-btn" id="btnReset" type="button">Reset</button><button class="icon-btn" id="btnPrint" type="button">Print</button></div><p class="hint" style="margin-top: 10px;">Export is a just in case. Print is a put it on the fridge.</p></details>
</div>
</section><section class="card col-6">
<h2>Projects</h2>
<p class="hint">Keep it short. Momentum beats guilt.</p>
<div class="row" style="align-items: end;">
<label style="display: grid; gap: 6px; flex: 1 1 220px;">
<span class="meta">Project</span>
<input id="projectText" placeholder="Fix the leaky faucet" type="text"/>
</label>
<label style="display: grid; gap: 6px; flex: 0 0 160px;">
<span class="meta">Due</span>
<input id="projectDue" type="date"/>
</label>
<button class="icon-btn" id="btnAddProject" type="button">Add</button>
</div>
<ul id="projectsList" style="margin-top: 12px;"></ul>
</section><section class="card col-6">
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
<input id="newWeeklyLabel" placeholder="Example: Trash night" type="text"/>
</label>
<button class="icon-btn" id="btnAddWeekly" type="button">Add</button>
</div>
<div class="meta" style="margin-top: 8px;">Current items</div>
<div id="weeklyItemsEditor" style="display: grid; gap: 8px;"></div>
<p class="hint">These items persist. The checkmarks reset every Monday.</p>
</div>
</details>
</section><section class="card" id="golfCard">
<h2>Golf rounds</h2>
<p class="hint">Track course, cost, score, and vibes. No hole-by-hole misery.</p>
<div class="golf-add">
<div class="golf-add-top">
<label class="golf-field">
<span class="meta">Golf course</span>
<input id="golfCourse" placeholder="Mountain Shadows" type="text"/>
</label>
<label class="golf-field">
<span class="meta">Price per round</span>
<input id="golfPrice" min="0" placeholder="45.00" step="0.01" type="number"/>
</label>
<div class="golf-partner">
<div class="meta">Second golfer</div>
<div class="segmented" id="golfPartnerToggle">
<input checked="" id="golfPartnerMaddie" name="golfPartner" type="radio" value="maddie"/>
<label for="golfPartnerMaddie">Maddie</label>
<input id="golfPartnerBoys" name="golfPartner" type="radio" value="boys"/>
<label for="golfPartnerBoys">The Boys</label>
</div>
</div>
<button class="icon-btn" id="btnAddGolfRound" type="button">Add round</button>
</div>
<div class="golf-entry">
<div class="golf-entry-head">
<div class="meta">Golfer</div>
<div class="meta">Score</div>
<div class="meta">Rating</div>
</div>
<div class="golf-entry-row">
<div class="golf-name">Jack</div>
<input id="golfScoreJack" inputmode="numeric" placeholder="89" type="number"/>
<input id="golfRatingJack" max="10" min="1" placeholder="8" step="1" type="number"/>
</div>
<div class="golf-entry-row" id="golfRowMaddie">
<div class="golf-name">Maddie</div>
<input id="golfScoreMaddie" inputmode="numeric" placeholder="82" type="number"/>
<input id="golfRatingMaddie" max="10" min="1" placeholder="9" step="1" type="number"/>
</div>
<div class="golf-entry-row" id="golfRowBoys">
<div class="golf-name">The Boys</div>
<input id="golfScoreBoys" inputmode="numeric" placeholder="101" type="number"/>
<input id="golfRatingBoys" max="10" min="1" placeholder="7" step="1" type="number"/>
</div>
</div>
</div>
<ul class="golf-rounds" id="golfRoundsList"></ul>
</section><section class="card">
<h2>Meal picker</h2>
<p class="hint">Decision fatigue is real. Let the machine choose.</p>
<div style="display: flex; gap: 10px; margin-top: 10px;">
<button class="icon-btn" id="btnPickMeal" type="button">Pick a meal</button>
<button class="icon-btn" id="btnCopyMeal" type="button">Copy ingredients</button>

</div>
<div class="card" style="margin-top: 12px;">
<div class="title" id="pickedMealTitle">No pick yet.</div>
<div class="meta" id="pickedMealIngredients"></div>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end; margin-top: 10px;">
<label style="display: grid; gap: 6px;">
<span class="meta">Meal name</span>
<input id="mealName" placeholder="Salmon bowls" type="text"/>
</label>
<label style="display: grid; gap: 6px;">
<span class="meta">Ingredients</span>
<input id="mealIngredients" placeholder="salmon, rice, cucumber, avocado..." type="text"/>
</label>
<button class="icon-btn" id="btnAddMeal" type="button">Add</button>
</div>
<ul id="mealsList" style="margin-top: 12px;"></ul>



</section><section class="card">
<h2>House notes</h2>
<p class="hint">Shutoffs, filter sizes, paint codes, contractor notes, the weird stuff your future self will forget.</p>
<textarea id="houseNotes" placeholder="Write the boring but important stuff here." rows="28"></textarea>
</section></section></main>
<script src="{{ asset('house-ops-assets/js/main.js') }}" type="module"></script>
</body>
</html>
