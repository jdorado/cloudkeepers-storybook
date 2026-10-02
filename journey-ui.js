import {
  ISLANDS,
  TOPICS,
  TRAVEL_STARS,
  RESCUE_STARS,
  nextQuestion,
  submitAnswer,
  rescueAnimal,
  unlockTravel,
  visitIsland,
  rescuedCount,
  journeyObjective,
  skill,
  changeYear,
  newAdventure,
} from "./adventure.js";
import { escapeText } from "./questions.js";
import { vehicleArt } from "./vehicles.js";

export function createJourneyUI(hooks) {
  const {
    game,
    content,
    modal,
    icon,
    save,
    toast,
    chime,
    closePanel,
    openPanel,
  } = hooks;
  const state = () => hooks.currentPlayer().adventure;
  let selected = state().current,
    feedback = null,
    feedbackType = "",
    transitioning = false;
  const header = (kicker, title, description = "") =>
    `<div class="modal-intro"><div class="eyebrow">${kicker}</div><h2 id="modal-title">${title}</h2><p>${description}</p></div>`;
  const stars = (n) =>
    `<div class="quest-stars" aria-label="${n} of five cloud stars">${Array.from({ length: 5 }, (_, i) => `<span class="${i < n ? "earned" : ""}">${icon("star")}</span>`).join("")}</div>`;
  const animalSource = (i) =>
    `assets/${i === 0 ? "pip" : ISLANDS[i].animal}.webp`;
  const animalArt = (i, big = false) =>
    `<img src="${animalSource(i)}" alt="${ISLANDS[i].friend} the ${ISLANDS[i].animal}" class="${big ? "reward-animal" : ""}">`;
  function update() {
    const s = state(),
      i = s.current,
      island = ISLANDS[i],
      record = s.islands[i],
      count = rescuedCount(s);
    game.dataset.island = i;
    game.dataset.year = s.year;
    game.style.setProperty(
      "--scene-hue",
      [0, 0, 0, 0, 15, -8, 0, 8, -7, 6, -10, -4][i] + "deg",
    );
    const scenery = game.querySelector(".scenery");
    scenery.src = `assets/${island.background}`;
    scenery.alt = `${island.name}, a floating island above the clouds`;
    document.querySelector("#island-title").innerHTML =
      `${island.name}<span class="title-flower">${island.glyph}</span>`;
    document.querySelector(".island-heading .eyebrow").innerHTML =
      `${icon("leaf")} ISLAND ${String(i + 1).padStart(2, "0")} <span>OF 12</span>`;
    document.querySelector(".island-heading>p").innerHTML =
      `${TOPICS[i]}<br>${island.friend} is ${record.rescued ? "in your crew!" : "waiting for you."}`;
    document.querySelector(".chapter-tag").innerHTML =
      `<span></span> YEAR ${s.year} · YOUR SKY ADVENTURE`;
    document.querySelector("#profile-name").innerHTML =
      `${hooks.playerName()}<small>Year ${s.year} Cloudkeeper</small>`;
    document.querySelector(".journey-row>strong").innerHTML =
      `${count} <small>/ 12</small>`;
    document
      .querySelector(".journey-progress")
      .setAttribute("aria-label", `${count} animals rescued`);
    document.querySelector(".journey-progress span").style.width =
      `${(count / 12) * 100}%`;
    document.querySelector(".journey-caption").textContent =
      `${s.islands.filter((x) => x.unlocked).length} islands open · ${record.stars}/5 stars here`;
    document.querySelector(".chapter-caption").innerHTML =
      `<span>✦</span> ${s.won ? "You brought every friend home." : island.description.split(".")[0] + "."}`;
    document.querySelector("#invitation .eyebrow").textContent = record.rescued
      ? "A FRIEND FOR YOUR SKY CREW"
      : `${record.stars} OF 5 CLOUD STARS`;
    document.querySelector("#invitation h2").textContent = record.rescued
      ? `${island.friend} is coming with you!`
      : `Help ${island.friend} find home`;
    document.querySelector("#invitation p").textContent = record.rescued
      ? record.travel
        ? "Ready for the next adventure."
        : "Light your way to the next island."
      : record.stars >= 3
        ? "Travel is ready. Your friend still needs you."
        : `Solve little puzzles. Make a big difference.`;
    const button = document.querySelector("#invitation .primary-button");
    button.removeAttribute("data-dialog");
    button.dataset.open = "quest";
    button.innerHTML = `${s.won ? "Our homecoming" : record.stars >= 3 ? "Your island rewards" : "Start adventure"} ${icon("arrow")}`;
    const fox = document.querySelector("#fox");
    fox.setAttribute(
      "aria-label",
      `Meet ${island.friend} the ${island.animal}`,
    );
    const img = fox.querySelector("img");
    img.src = animalSource(i);
    img.alt = `${island.friend}, your little ${island.animal} friend`;
    fox.querySelector(".object-label").innerHTML =
      `<span class="hello-dot"></span>${island.friend}${record.rescued ? " ♥" : ""}`;
    document.querySelector("#ferry").innerHTML =
      vehicleArt(island.vehicle) +
      `<span class="ferry-label">${island.travel} ${record.travel ? "· Ready!" : `· ${TRAVEL_STARS} stars`}</span>`;
    document
      .querySelector("#ferry")
      .setAttribute(
        "aria-label",
        `Discover the ${island.travel.toLowerCase()}`,
      );
    let crew = document.querySelector("#crew");
    if (!crew) {
      crew = document.createElement("div");
      crew.id = "crew";
      crew.className = "crew-bar";
      game.append(crew);
    }
    crew.innerHTML = `<span>${count ? "YOUR SKY CREW" : "YOUR CREW STARTS HERE"}</span>${s.islands.map((r, index) => (r.rescued ? `<button data-friend="${index}" aria-label="${ISLANDS[index].friend}, rescued"><img src="${animalSource(index)}" alt=""></button>` : "")).join("")}${count ? `<small>${count}/12</small>` : ""}`;
    crew.hidden = count === 0;
    document
      .querySelector(".brand")
      .setAttribute("aria-label", "Cloudkeepers — your adventure is saved");
  }
  function rewardButtons() {
    const s = state(),
      i = s.current,
      r = s.islands[i],
      island = ISLANDS[i];
    return `<div class="reward-options"><button class="reward-option ${r.travel ? "claimed" : ""}" data-game="unlock" ${r.stars < 3 || r.travel ? "disabled" : ""}>${icon(r.travel ? "check" : "map")}<span><strong>${i === 11 ? "Light the home beacon" : "Unlock " + island.travel}</strong><small>${r.travel ? "Ready for your crew" : `${TRAVEL_STARS} cloud stars${r.stars >= 3 ? " · Ready!" : ""}`}</small></span></button><button class="reward-option ${r.rescued ? "claimed" : ""}" data-game="rescue" ${r.stars < 5 || r.rescued ? "disabled" : ""}>${icon(r.rescued ? "check" : "paw")}<span><strong>${r.rescued ? island.friend + " is in your crew" : "Rescue " + island.friend}</strong><small>${r.rescued ? "Safe, happy, and coming with you" : `${RESCUE_STARS} cloud stars${r.stars >= 5 ? " · Ready!" : ""}`}</small></span></button></div>`;
  }
  function renderQuest() {
    const s = state(),
      i = s.current,
      island = ISLANDS[i],
      r = s.islands[i],
      count = rescuedCount(s),
      objective = journeyObjective(s);
    if (s.won) {
      renderVictory();
      return;
    }
    const remaining = RESCUE_STARS - r.stars;
    let primaryAction = "challenge",
      primaryLabel =
        r.stars === 0
          ? "Let’s help!"
          : r.stars < TRAVEL_STARS
            ? "Earn another star"
            : `Earn ${remaining} more star${remaining === 1 ? "" : "s"} to rescue ${island.friend}`,
      primaryIcon = "star",
      secondary = "";
    if (objective === "rescue") {
      primaryAction = "rescue";
      primaryLabel = `Rescue ${island.friend}`;
      primaryIcon = "paw";
    } else if (objective === "return-haven") {
      primaryAction = "haven";
      primaryLabel = "Return to Cloudkeeper Haven";
      primaryIcon = "heart";
    } else if (objective === "unlock-travel" || objective === "light-beacon") {
      primaryAction = "unlock";
      primaryLabel =
        objective === "light-beacon"
          ? "Light the home beacon"
          : `Unlock ${island.travel}`;
      primaryIcon = "map";
    } else if (objective === "travel-forward") {
      primaryAction = "forward";
      primaryLabel = `Travel to ${ISLANDS[i + 1].name}`;
      primaryIcon = "arrow";
    } else if (objective === "find-missing") {
      primaryAction = "missing";
      primaryLabel = `Find my missing friends (${12 - count})`;
      primaryIcon = "map";
    }
    if (
      (objective === "earn-star" || objective === "rescue") &&
      r.travel &&
      i < 11
    )
      secondary = `<button class="secondary-button" data-game="forward">Travel now · ${island.friend} stays here ${icon("arrow")}</button>`;
    else if (
      [
        "return-haven",
        "unlock-travel",
        "light-beacon",
        "travel-forward",
        "find-missing",
      ].includes(objective)
    )
      secondary = `<button class="secondary-button" data-game="challenge">Practise this topic ${icon("star")}</button>`;
    content.innerHTML = `<div class="quest-intro"><div class="quest-portrait">${animalArt(i, true)}</div><div>${header(`ISLAND ${i + 1} · ${TOPICS[i]}`, r.rescued ? `${island.friend} is safe!` : `A little help for ${island.friend}`, island.description)}${stars(r.stars)}<div class="quest-start-buttons"><button class="primary-button" data-game="${primaryAction}">${primaryLabel} ${icon(primaryIcon)}</button>${secondary}</div></div></div>${rewardButtons()}<div class="modal-note">${icon("heart")} Travel opens at 3 stars. Your friend is ready to rescue at 5. Come back for anyone you leave behind.</div>${i === 11 && count < 12 && objective !== "find-missing" ? `<button class="secondary-button return-friends" data-game="missing">Find my missing friends (${12 - count})</button>` : ""}`;
  }
  function renderQuiz() {
    const s = state();
    const q = s.session?.question || nextQuestion(s);
    save();
    const session = s.session,
      r = s.islands[s.current];
    content.innerHTML = `<div class="quiz-header"><div><div class="eyebrow">YEAR ${s.year} · ${TOPICS[q.topic]}</div><h2 id="modal-title">A little cloud challenge</h2></div><span class="difficulty-pill">${["Little steps", "Growing wings", "Stretching"][q.level]}</span></div><div class="quiz-progress">${stars(r.stars)}<span>${r.stars}/5 cloud stars</span></div><div class="question-body"><p class="math-prompt" id="math-prompt">${escapeText(q.prompt)}</p>${q.visual ? `<div class="math-visual">${q.visual}</div>` : ""}</div><div class="answer-options">${q.options.map((option, i) => `<button class="answer-button ${session.solved && option.value === q.answer ? "correct-answer" : ""}" data-answer="${escapeText(option.value)}" data-question="${q.id}" ${session.solved ? "disabled" : ""}><span class="answer-number">${i + 1}</span>${escapeText(option.label)}</button>`).join("")}</div>${q.numeric && !session.solved ? `<form id="math-answer" class="typed-answer"><label for="answer-input">Or type your answer:</label><input id="answer-input" name="answer" type="text" inputmode="numeric" pattern="[0-9]+" autocomplete="off" placeholder="?" aria-label="Your answer"><button class="secondary-button" type="submit">Check</button></form>` : ""}<div id="answer-feedback" class="answer-feedback ${session.solved ? "success" : feedbackType}" role="status" aria-live="polite">${session.solved ? `${icon("star")} Well done! ${escapeText(q.explanation)}` : feedback ? escapeText(feedback) : session.hint ? escapeText(q.hint) : ""}</div><div class="quiz-footer">${session.solved ? `<button class="primary-button" data-game="${r.stars >= 3 ? "rewards" : "next"}">${r.stars >= 3 ? "See my island rewards" : "Next little challenge"} ${icon("arrow")}</button><button class="secondary-button" data-game="next">${r.stars >= 3 ? "Another challenge" : "Back to island"}</button>` : `<button class="secondary-button" data-game="hint">${icon("leaf")} A little hint</button><button class="secondary-button" data-game="read">${icon("sound")} Read it to me</button><button class="text-button" data-game="skip">Try a different question</button>`}</div>`;
    if (session.solved && r.stars < 3)
      content.querySelector(".quiz-footer .secondary-button").dataset.game =
        "rewards";
  }
  function renderMap() {
    const s = state();
    selected = s.current;
    const path = ISLANDS.map(
      (island, i) => `${i ? "L" : "M"} ${island.x} ${island.y}`,
    ).join(" ");
    content.innerHTML = `${header("TWELVE LITTLE WORLDS · ONE BIG ADVENTURE", "Your sky journey", "Tap an island. Return to any open island to help a friend you missed.")}<div class="map-layout"><div class="map-canvas" aria-label="Map of twelve floating islands"><svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${path}" vector-effect="non-scaling-stroke"/></svg><div class="map-cloud"></div><div class="map-cloud"></div>${ISLANDS.map((island, i) => `<button class="map-island ${i === selected ? "selected" : ""} ${!s.islands[i].unlocked ? "locked" : ""}" data-island="${i}" aria-label="Island ${i + 1}, ${island.name}${s.islands[i].rescued ? ", animal rescued" : s.islands[i].unlocked ? ", open" : ", locked"}" aria-pressed="${i === selected}" style="--mx:${island.x};--my:${island.y};--island-color:${island.color}"><span class="island-number">${s.islands[i].rescued ? "♥" : String(i + 1).padStart(2, "0")}</span><span class="island-mini" aria-hidden="true">${island.glyph}</span><span class="island-name">${island.name}</span></button>`).join("")}</div><div class="map-detail" id="map-detail" aria-live="polite"></div></div><div class="modal-note">${icon("paw")} ${rescuedCount(s)} of 12 friends rescued. All twelve must reach Cloudkeeper Haven together.</div>`;
    renderMapDetail();
  }
  function renderMapDetail() {
    const s = state(),
      island = ISLANDS[selected],
      r = s.islands[selected];
    document.querySelector("#map-detail").innerHTML =
      `<div class="detail-art" style="--island-color:${island.color}"><span class="island-mini" aria-hidden="true">${island.glyph}</span></div><div class="eyebrow">ISLAND ${selected + 1} · ${r.unlocked ? "OPEN" : "LOCKED"}</div><h3>${island.name}</h3><p>${island.description}</p><div class="detail-tags"><span>${icon("paw")} ${island.friend}${r.rescued ? " · Rescued!" : ""}</span><span>${TOPICS[selected]}</span><span>${r.stars}/5 stars</span></div><button class="primary-button" data-game="visit" ${r.unlocked ? "" : "disabled"}>${selected === s.current ? "Explore this island" : r.unlocked ? "Travel here" : "Unlock travel on island " + selected} ${icon("arrow")}</button>`;
  }
  function renderFriends() {
    const s = state();
    content.innerHTML = `${header("THE CLOUDKEEPER’S FIELD JOURNAL", "Your animal friends", `${rescuedCount(s)} of twelve friends are travelling with you.`)}<div class="friends-grid">${ISLANDS.map((island, i) => `<button class="friend-card ${s.islands[i].rescued ? "met" : ""}" data-friend="${i}" aria-label="Meet ${island.friend} the ${island.animal}"><span class="friend-art">${animalArt(i)}</span><h3>${island.friend}</h3><p>${island.name}</p><span class="friend-status">${s.islands[i].rescued ? "SAFE IN YOUR CREW" : s.islands[i].unlocked ? "WAITING FOR YOUR HELP" : "ON A FUTURE ISLAND"}</span></button>`).join("")}</div><div class="modal-note">${icon("heart")} Your rescued friends follow you on every journey. Visiting an island alone never rescues its animal.</div>`;
  }
  function renderFriend(i) {
    const s = state(),
      island = ISLANDS[i];
    content.innerHTML = `<div class="dialogue-layout"><div class="dialogue-portrait">${animalArt(i, true)}</div><div>${header(s.islands[i].rescued ? "A HAPPY MEMBER OF YOUR CREW" : "A FRIEND WAITING IN THE CLOUDS", `Meet ${island.friend}`, s.islands[i].rescued ? `“Thank you, ${hooks.playerName()}! I love travelling with our friends.”` : island.description)}<div class="dialogue-buttons">${s.islands[i].unlocked ? `<button class="primary-button" data-go-friend="${i}">${s.islands[i].rescued ? "Visit their island" : "Go and help " + island.friend} ${icon("arrow")}</button>` : ""}<button class="secondary-button" data-game="friends">Back to the journal</button></div></div></div>`;
  }
  function renderProfiles() {
    const s = state();
    content.innerHTML = `${header("EVERY CLOUDKEEPER HAS A STORY", "Who’s exploring today?", "Each explorer has their own animals, islands, questions, and maths level.")}<div class="profile-grid">${hooks
      .profileEntries()
      .map(([id, profile]) => {
        const p = profile.data.adventure;
        const selected = hooks.currentProfileId() === id;
        return `<button class="player-option ${selected ? "selected" : ""}" data-player="${id}" aria-pressed="${selected}"><img src="assets/explorer.webp" alt="Cloudkeeper explorer"><h3>${escapeText(profile.nickname)}</h3><p>Year ${p.year} · ${rescuedCount(p)}/12 animal friends</p></button>`;
      })
      .join(
        "",
      )}</div><div class="level-settings"><label>Explorer nickname<input id="player-nickname" maxlength="30" autocomplete="off" value="${escapeText(hooks.playerName())}" aria-label="Explorer nickname"></label><label>Maths level for ${escapeText(hooks.playerName())}<select id="maths-year" aria-label="Maths level for ${escapeText(hooks.playerName())}"><option value="1" ${s.year === 1 ? "selected" : ""}>Year 1 · Counting and little steps</option><option value="3" ${s.year === 3 ? "selected" : ""}>Year 3 · Bigger numbers and new ideas</option></select></label><label>Money questions<select id="money-currency" aria-label="Money questions"><option value="GBP" ${s.currency === "GBP" ? "selected" : ""}>UK pounds and pence</option><option value="AED" ${s.currency === "AED" ? "selected" : ""}>UAE dirhams</option></select></label></div><button class="secondary-button" data-game="stats">Grown-up corner ${icon("book")}</button><div class="modal-note">${icon("check")} Progress saves automatically. Signed-in families can continue on another device.</div>`;
  }
  function renderStats() {
    const s = state(),
      total = s.correct + s.incorrect;
    content.innerHTML = `${header("GROWN-UP CORNER", `${hooks.playerName()}’s maths journey`, "A practice summary to help you decide what to explore next.")}<div class="stats-overview"><span><strong>${s.correct}</strong>correct answers</span><span><strong>${rescuedCount(s)}/12</strong>rescued friends</span><span><strong>${total ? Math.round((s.correct / total) * 100) : 0}%</strong>accuracy across attempts</span></div><div class="skills-list">${TOPICS.map(
      (topic, i) => {
        const sk = skill(s, i);
        return `<div><span>${topic}</span><span>${sk.correct} correct · ${sk.incorrect} retries</span><small>${["Little steps", "Growing wings", "Stretching"][sk.level]}</small></div>`;
      },
    ).join(
      "",
    )}</div><p class="help-footer">Based on the English Year 1 and Year 3 maths programmes. This game practises selected skills; your school’s lessons and written work remain important. Wrong answers are retries, with no lost stars.</p><div class="stats-actions"><button class="secondary-button" data-game="profile">Explorer settings</button><button class="text-button" data-game="reset-confirm">Start this explorer’s journey again</button></div>`;
  }
  function renderHelp() {
    content.innerHTML = `${header("A LITTLE HELP FOR YOUR ADVENTURE", "Twelve islands. Twelve new friends.", "No timer, no rush. A kind heart and a little maths will take you far.")}<div class="help-grid"><div class="help-card">${icon("star")}<h3>Earn cloud stars</h3><p>Tap Start adventure or your island animal. Answer a question to earn one star. Hints help you learn; mistakes never take stars away.</p></div><div class="help-card">${icon("map")}<h3>Unlock your ride</h3><p>At 3 stars, unlock the island’s transport. You can travel onward and use the sky map to return to open islands.</p></div><div class="help-card">${icon("paw")}<h3>Rescue your friend</h3><p>At 5 stars, tap Rescue to add the animal to your crew. Every rescued friend travels with you.</p></div><div class="help-card">${icon("heart")}<h3>Bring everyone home</h3><p>Rescue all 12 animals, reach Cloudkeeper Haven, and light its home beacon. That’s how a Cloudkeeper wins!</p></div></div><p class="help-footer">Wander using arrow keys, W A S D, or a tap on the grass. Choose an explorer at the top. Sunshine, moonlight, and soft sounds are yours to explore.</p><button class="secondary-button" data-game="profile">Choose explorer and maths level</button>`;
  }
  function renderVictory() {
    const s = state();
    content.innerHTML = `<div class="victory-screen"><div class="victory-star">${icon("star")}</div><div class="eyebrow">ALL TWELVE FRIENDS · TOGETHER AT LAST</div><h2 id="modal-title">You are a Cloudkeeper!</h2><p>${hooks.playerName()}, you brought every animal safely home.<br>Your maths, patience, and kindness made this whole sky brighter.</p><div class="homecoming-crew">${ISLANDS.map((i, index) => `<span title="${i.friend}"><img src="${animalSource(index)}" alt="${i.friend}"></span>`).join("")}</div><div class="victory-summary">12 islands · 12 rescued friends · ${s.correct} correct answers</div><div class="dialogue-buttons"><button class="primary-button" data-game="return">Explore with my friends ${icon("heart")}</button><button class="secondary-button" data-game="stats">Our maths journey</button></div></div>`;
  }
  function renderDialogue(type) {
    if (type === "pip" || type === "ferry") {
      renderQuest();
      return;
    }
    if (type === "sign") {
      renderMap();
      return;
    }
    content.innerHTML = `<div class="dialogue-layout"><div class="dialogue-portrait"><span class="big-glyph">🏡</span></div><div>${header("A COSY CORNER OF THE SKY", "A little home for big dreams", "Your cottage is a place to rest between adventures. Your progress is saved automatically.")}<div class="dialogue-buttons"><button class="primary-button" data-game="quest">Help our island friend</button><button class="secondary-button" data-game="stats">My maths journey</button></div></div></div>`;
  }
  function render(panel) {
    feedback = null;
    feedbackType = "";
    if (panel === "quest") renderQuest();
    else if (panel === "quiz") renderQuiz();
    else if (panel === "map") renderMap();
    else if (panel === "friends") renderFriends();
    else if (panel === "profile") renderProfiles();
    else if (panel === "help") renderHelp();
    else if (panel === "stats") renderStats();
    else if (panel === "victory") renderVictory();
    else renderDialogue(panel);
  }
  function answer(id, value) {
    const result = submitAnswer(state(), id, value);
    if (result.ignored) return;
    feedback = result.correct ? null : result.explanation;
    feedbackType = result.correct ? "success" : "retry";
    save();
    update();
    if (result.correct) chime();
    renderQuiz();
    if (result.correct)
      content.querySelector(".quiz-footer .primary-button")?.focus();
  }
  async function travel(index) {
    if (transitioning || !state().islands[index]?.unlocked) return;
    transitioning = true;
    hooks.setTravelling(true);
    closePanel();
    const clouds = document.querySelector("#travel-clouds"),
      ferry = document.querySelector("#ferry");
    clouds.classList.add("fly");
    ferry.classList.add("flying");
    chime();
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        matchMedia("(prefers-reduced-motion:reduce)").matches ? 50 : 750,
      ),
    );
    visitIsland(state(), index);
    save();
    update();
    hooks.resetPosition();
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        matchMedia("(prefers-reduced-motion:reduce)").matches ? 50 : 900,
      ),
    );
    clouds.classList.remove("fly");
    ferry.classList.remove("flying");
    transitioning = false;
    hooks.setTravelling(false);
    toast(`Welcome to ${ISLANDS[index].name}!`);
    if (state().won) openPanel("victory");
  }
  function click(button) {
    if (button.dataset.answer !== undefined) {
      answer(button.dataset.question, button.dataset.answer);
      return true;
    }
    if (button.dataset.island !== undefined) {
      selected = Number(button.dataset.island);
      content.querySelectorAll("[data-island]").forEach((node) => {
        const yes = Number(node.dataset.island) === selected;
        node.classList.toggle("selected", yes);
        node.setAttribute("aria-pressed", String(yes));
      });
      renderMapDetail();
      return true;
    }
    if (button.dataset.friend !== undefined) {
      if (!modal.open) openPanel("friends");
      renderFriend(Number(button.dataset.friend));
      return true;
    }
    if (button.dataset.goFriend !== undefined) {
      travel(Number(button.dataset.goFriend));
      return true;
    }
    const action = button.dataset.game;
    if (!action) return false;
    if (action === "challenge" || action === "next" || action === "skip") {
      if (action === "skip" && state().session && !state().session.solved) {
        const sk = skill(state(), state().session.question.topic);
        sk.level = Math.max(0, sk.level - 1);
        state().session = null;
      }
      if (state().session?.solved) state().session = null;
      feedback = null;
      feedbackType = "";
      renderQuiz();
    } else if (action === "hint") {
      state().session.hint = true;
      save();
      renderQuiz();
    } else if (action === "read") {
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
        const q = state().session.question;
        const speech = new SpeechSynthesisUtterance(
          q.prompt
            .replace(/×/g, " times ")
            .replace(/÷/g, " divided by ")
            .replace(/−/g, " minus "),
        );
        speech.lang = "en-GB";
        speech.rate = 0.85;
        speechSynthesis.speak(speech);
      } else toast("Read-aloud is not available in this browser.");
    } else if (action === "rewards" || action === "quest") {
      feedback = null;
      renderQuest();
    } else if (action === "unlock") {
      if (unlockTravel(state())) {
        save();
        update();
        chime();
        state().won ? openPanel("victory") : renderQuest();
        toast(`${ISLANDS[state().current].travel} unlocked!`);
      }
    } else if (action === "rescue") {
      if (rescueAnimal(state())) {
        save();
        update();
        chime();
        hooks.celebrate();
        state().won ? openPanel("victory") : renderQuest();
        toast(`${ISLANDS[state().current].friend} has joined your crew!`);
      }
    } else if (action === "forward") travel(state().current + 1);
    else if (action === "haven") travel(11);
    else if (action === "visit")
      selected === state().current ? closePanel() : travel(selected);
    else if (action === "missing") {
      renderMap();
      selected = state().islands.findIndex((x) => !x.rescued);
      renderMapDetail();
    } else if (
      ["friends", "profile", "stats", "victory", "help"].includes(action)
    )
      render(action);
    else if (action === "return") closePanel();
    else if (action === "reset-confirm") {
      content.innerHTML = `${header("A FRESH SKY ADVENTURE", "Start again?", `This clears only ${hooks.playerName()}’s animals, island stars, and maths practice. The other explorer keeps their journey.`)}<div class="dialogue-buttons"><button class="primary-button" data-game="reset">Yes, a new adventure</button><button class="secondary-button" data-game="stats">Keep my journey</button></div>`;
    } else if (action === "reset") {
      const { year, currency } = state();
      hooks.currentPlayer().adventure = newAdventure(year);
      state().currency = currency;
      save();
      update();
      closePanel();
      hooks.resetPosition();
      toast("A fresh sky full of possibility!");
    }
    return true;
  }
  document.addEventListener("submit", (event) => {
    if (event.target.id !== "math-answer") return;
    event.preventDefault();
    const input = event.target.elements.answer;
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    answer(state().session.question.id, input.value);
  });
  document.addEventListener("input", (event) => {
    if (event.target.id !== "player-nickname") return;
    const nickname = event.target.value.trim().slice(0, 30);
    if (nickname) hooks.renamePlayer(hooks.currentProfileId(), nickname);
  });
  document.addEventListener("change", (event) => {
    if (event.target.id === "maths-year") {
      changeYear(state(), Number(event.target.value));
      save();
      update();
      toast(`Year ${state().year} maths selected.`);
    } else if (event.target.id === "money-currency") {
      state().currency = event.target.value === "AED" ? "AED" : "GBP";
      state().session = null;
      save();
      toast("Money questions updated.");
    } else if (event.target.id === "player-nickname") {
      const nickname = event.target.value.trim().slice(0, 30);
      if (!nickname) {
        event.target.value = hooks.playerName();
        return;
      }
      toast(`Hello, ${nickname}!`);
    }
  });
  return {
    update,
    render,
    renderMap,
    renderMapDetail,
    renderFriends,
    renderProfiles,
    renderHelp,
    renderDialogue,
    click,
    handles: (panel) =>
      [
        "quest",
        "quiz",
        "map",
        "friends",
        "profile",
        "help",
        "stats",
        "victory",
        "pip",
        "cottage",
        "sign",
        "ferry",
      ].includes(panel),
  };
}
