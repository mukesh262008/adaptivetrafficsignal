(() => {
  "use strict";

  const initialJunctions = [
    { id: "J1", name: "Junction 1", direction: "North", cars: 87, emergency: 2, wait: 43 },
    { id: "J2", name: "Junction 2", direction: "East", cars: 60, emergency: 0, wait: 35 },
    { id: "J3", name: "Junction 3", direction: "South", cars: 40, emergency: 0, wait: 20 },
    { id: "J4", name: "Junction 4", direction: "West", cars: 56, emergency: 1, wait: 27 }
  ];
  const initialQueue = [
    { token: 101, customer: "Arun", wait: 42 },
    { token: 102, customer: "Priya", wait: 38 },
    { token: 103, customer: "Karthik", wait: 31 },
    { token: 104, customer: "Sneha", wait: 27 },
    { token: 105, customer: "Vignesh", wait: 22 }
  ];
  const originalJunctions = initialJunctions.map(item => ({ ...item }));
  const state = {
    junctions: initialJunctions.map(item => ({ ...item })),
    queue: initialQueue.map(item => ({ ...item })),
    selectedId: "J1",
    activities: [
      { time: "10:23", text: "Token 101 generated for Arun", color: "" },
      { time: "10:21", text: "Token 102 generated for Priya", color: "amber" },
      { time: "10:18", text: "Token 103 generated for Karthik", color: "amber" },
      { time: "10:16", text: "Token 101 served", color: "" },
      { time: "10:14", text: "Token 102 served", color: "blue" },
      { time: "10:12", text: "Token 103 served", color: "purple" }
    ],
    simTimer: null,
    startedAt: null,
    generatedId: 5,
    nextToken: 106,
    emergencyLock: null,
    transitionId: null,
    transitionTimer: null,
    lastSelectedId: null,
    dismissedBanner: false
  };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const byId = id => state.junctions.find(junction => junction.id === id);
  const directionOrder = ["North", "East", "South", "West"];
  const colors = ["", "amber", "blue", "purple", "red"];

  function calculatePriority(junction) {
    if (junction.emergency > 0) return { level: 3, label: "Emergency", full: "Emergency Priority" };
    if (junction.cars > 70 && junction.wait > 40) return { level: 2, label: "High", full: "High Traffic Priority" };
    if (junction.cars > 50 || junction.wait > 30) return { level: 1, label: "Medium", full: "Medium Traffic Priority" };
    return { level: 0, label: "Low", full: "Low Traffic Priority" };
  }

  function calculateCongestion(junction) {
    if (junction.cars >= 70 || junction.wait >= 40) return "High";
    if (junction.cars >= 45 || junction.wait >= 25) return "Medium";
    return "Low";
  }

  function selectHighestPriorityJunction() {
    if (!state.junctions.length) return null;
    const sorted = [...state.junctions].sort((a, b) => {
      const priorityDifference = calculatePriority(b).level - calculatePriority(a).level;
      if (priorityDifference) return priorityDifference;
      const emergencyDifference = b.emergency - a.emergency;
      if (emergencyDifference) return emergencyDifference;
      const pressureDifference = (b.cars + b.wait) - (a.cars + a.wait);
      return pressureDifference || a.id.localeCompare(b.id, undefined, { numeric: true });
    });
    if (state.emergencyLock && byId(state.emergencyLock)?.emergency > 0) return byId(state.emergencyLock);
    return sorted[0];
  }

  function recordActivity(text, color = "") {
    const now = new Date();
    state.activities.unshift({ time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), text, color });
    state.activities = state.activities.slice(0, 40);
  }

  function timeString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function priorityClass(level) {
    return ["badge-low", "badge-medium", "badge-high", "badge-emergency"][level];
  }

  function waitClass(wait) {
    return wait >= 40 ? "wait-critical" : wait > 30 ? "wait-warn" : "wait-normal";
  }

  function getAverageWait() {
    return state.junctions.length ? Math.round(state.junctions.reduce((total, item) => total + item.wait, 0) / state.junctions.length) : 0;
  }

  function getTotalCars() {
    return state.junctions.reduce((total, item) => total + item.cars, 0);
  }

  function getTotalEmergencies() {
    return state.junctions.reduce((total, item) => total + item.emergency, 0);
  }

  function renderTable() {
    const rows = state.junctions.map(junction => {
      const priority = calculatePriority(junction);
      return `<tr><td>${escapeHTML(junction.id)}</td><td>${junction.cars}</td><td>${junction.emergency}</td><td>${junction.wait}s</td><td><span class="priority-badge ${priorityClass(priority.level)}">${priority.label}</span></td></tr>`;
    }).join("");
    $("#junction-table-body").innerHTML = rows || '<tr><td colspan="5">No junctions yet</td></tr>';
    $("#junction-full-body").innerHTML = state.junctions.map(junction => {
      const priority = calculatePriority(junction);
      const signal = junction.id === state.transitionId ? "YELLOW" : junction.id === state.selectedId ? "GREEN" : "RED";
      return `<tr><td>${escapeHTML(junction.name)} <span class="queue-junction">(${escapeHTML(junction.id)})</span></td><td>${junction.cars}</td><td>${junction.emergency}</td><td>${junction.wait}</td><td><span class="congestion-badge">${calculateCongestion(junction)}</span></td><td><span class="priority-badge ${priorityClass(priority.level)}">${priority.full}</span></td><td><span class="signal-badge signal-${signal.toLowerCase()}">${signal}</span></td></tr>`;
    }).join("") || '<tr><td colspan="7">Add a junction to get started.</td></tr>';
  }

  function renderQueue() {
    const selected = byId(state.selectedId);
    $("#queue-junction").textContent = `(${selected ? selected.id : "—"})`;
    $("#traffic-queue-junction").textContent = `(${selected ? selected.id : "—"})`;
    const visibleQueue = state.queue;
    $("#queue-table-body").innerHTML = visibleQueue.length ? visibleQueue.map(token =>
      `<tr><td>${token.token}</td><td>${escapeHTML(token.customer)}</td><td><span class="wait-badge ${waitClass(token.wait)}">${token.wait} sec</span></td></tr>`
    ).join("") : '<tr><td colspan="3">Queue is empty</td></tr>';
    $("#queue-visual").innerHTML = visibleQueue.length ? visibleQueue.map((token, index) =>
      `${index ? '<span class="queue-arrow">→</span>' : ""}<div class="queue-token ${index === 0 ? "front-token" : ""}"><strong>Vehicle ${token.token - 100}</strong><small>${escapeHTML(token.customer)} · ${token.wait}s</small></div>`
    ).join("") : '<p class="queue-note">No vehicles are waiting. Enqueue a vehicle to begin.</p>';
  }

  function renderActivity() {
    const markup = state.activities.slice(0, 7).map(item =>
      `<div class="activity-item"><time>${escapeHTML(item.time)}</time><i class="activity-dot ${colors.includes(item.color) ? item.color : ""}"></i><p>${escapeHTML(item.text)}</p></div>`
    ).join("");
    $("#activity-list").innerHTML = markup || '<div class="activity-item"><p>No recent activity.</p></div>';
    $("#full-activity-list").innerHTML = state.activities.map(item =>
      `<div class="activity-item"><time>${escapeHTML(item.time)}</time><i class="activity-dot ${colors.includes(item.color) ? item.color : ""}"></i><p>${escapeHTML(item.text)}</p></div>`
    ).join("");
  }

  function renderMap() {
    const slots = { North: "north", East: "east", South: "south", West: "west" };
    directionOrder.forEach(direction => {
      const element = $(`#map-label-${slots[direction]}`);
      if (!element) return;
      const junction = state.junctions.find(item => item.direction === direction);
      if (!junction) {
        element.hidden = true;
        return;
      }
      element.hidden = false;
      const active = junction.id === state.selectedId;
      const signal = junction.id === state.transitionId ? "yellow" : active ? "green" : "red";
      element.className = `junction-label label-${slots[direction]} is-${signal}`;
      element.innerHTML = `<strong>${escapeHTML(junction.id)}</strong><small>(${escapeHTML(junction.direction)})</small><em>${signal[0].toUpperCase()}${signal.slice(1)}</em>`;
    });
    $$(".junction-label").forEach(label => { if (!label.innerHTML) label.hidden = true; });
  }

  function renderNetwork() {
    const positions = ["NW", "NE", "SW", "SE"];
    const nodes = state.junctions.map((junction, index) => ({ junction, position: positions[index] || `E${index - 3}` }));
    $("#network-graph").innerHTML = nodes.map(({ junction, position }) =>
      `<div class="network-node-wrap" style="grid-area:${position === "NW" ? "1 / 1" : position === "NE" ? "1 / 2" : position === "SW" ? "2 / 1" : position === "SE" ? "2 / 2" : "auto"}"><div class="network-node ${junction.id === state.selectedId ? "selected" : ""}"><strong>${escapeHTML(junction.id)}</strong><small>${junction.cars} cars</small></div></div>`
    ).join("");
    if (nodes.length > 4) {
      $("#network-graph").insertAdjacentHTML("beforeend", `<p class="network-extra">+ ${nodes.length - 4} more connected junction${nodes.length === 5 ? "" : "s"}</p>`);
    }
  }

  function renderCharts() {
    const maxCars = Math.max(1, ...state.junctions.map(item => item.cars));
    const maxWait = Math.max(1, ...state.junctions.map(item => item.wait));
    const chart = (type, max, big = false) => state.junctions.map(junction => {
      const value = type === "cars" ? junction.cars : junction.wait;
      const height = Math.max(5, Math.round(value / max * 78));
      return big
        ? `<div class="large-bar"><b>${value}${type === "wait" ? "s" : ""}</b><i style="height:${height}%"></i><small>${escapeHTML(junction.id)}</small></div>`
        : `<div class="bar-column"><b>${value}</b><i style="height:${height}%"></i><small>${escapeHTML(junction.id)}</small></div>`;
    }).join("");
    $("#density-chart").innerHTML = chart("cars", maxCars);
    $("#waiting-chart").innerHTML = chart("wait", maxWait);
    $("#traffic-density-chart").innerHTML = chart("cars", maxCars, true);
    $("#traffic-waiting-chart").innerHTML = chart("wait", maxWait, true);
    const counts = [0, 0, 0, 0];
    state.junctions.forEach(item => counts[calculatePriority(item).level]++);
    const colorsByPriority = ["#20a663", "#f0ac22", "#ec9520", "#e34b56"];
    const labels = ["Low", "Medium", "High", "Emergency"];
    $("#priority-distribution").innerHTML = labels.map((label, index) =>
      `<span class="distribution-item"><i style="background:${colorsByPriority[index]}"></i>${label} <b>${counts[index]}</b></span>`
    ).join("");
  }

  function renderJunctionCards() {
    $("#junction-cards").innerHTML = state.junctions.map(junction => {
      const priority = calculatePriority(junction);
      const active = junction.id === state.selectedId;
      const signal = junction.id === state.transitionId ? "yellow" : active ? "green" : "red";
      return `<article class="panel junction-card ${active ? "active-junction-card" : ""}"><div class="junction-card-header"><h3>${escapeHTML(junction.name)}</h3><div class="junction-signal-display"><span class="traffic-light signal-${signal}" aria-label="${signal} signal"><i class="lamp-red"></i><i class="lamp-yellow"></i><i class="lamp-green"></i></span><span class="signal-badge signal-${signal}">${signal.toUpperCase()}</span></div></div><div class="junction-card-metrics"><div><span>Cars</span><strong>${junction.cars}</strong></div><div><span>Emergency</span><strong>${junction.emergency}</strong></div><div><span>Waiting time</span><strong>${junction.wait}<small> sec</small></strong></div><div><span>Congestion</span><strong>${calculateCongestion(junction)}</strong></div></div><span class="priority-badge ${priorityClass(priority.level)}">${priority.full}</span></article>`;
    }).join("");
    $("#traffic-stat-row").innerHTML = [
      ["Network vehicles", getTotalCars()],
      ["Emergency vehicles", getTotalEmergencies()],
      ["Average wait", `${getAverageWait()} sec`],
      ["Junctions", state.junctions.length]
    ].map(([label, value]) => `<article class="panel traffic-stat"><span>${label}</span><strong>${value}</strong></article>`).join("");
  }

  function updateDashboard() {
    const winner = selectHighestPriorityJunction();
    if (winner) {
      const changed = state.lastSelectedId !== null && state.lastSelectedId !== winner.id;
      if (changed) {
        state.transitionId = state.selectedId;
        if (state.transitionTimer) window.clearTimeout(state.transitionTimer);
        state.transitionTimer = window.setTimeout(() => {
          state.transitionId = null;
          state.transitionTimer = null;
          updateDashboard();
        }, 450);
      }
      if (changed) recordActivity(`Priority changed · ${winner.id} now has GREEN`, "blue");
      state.selectedId = winner.id;
      $("#active-junction").textContent = winner.id;
      $("#active-junction-caption").textContent = calculatePriority(winner).full;
    } else {
      state.selectedId = "";
      $("#active-junction").textContent = "—";
      $("#active-junction-caption").textContent = "No junctions available";
    }
    state.lastSelectedId = state.selectedId;
    $("#total-vehicles").textContent = getTotalCars();
    $("#emergency-count").textContent = getTotalEmergencies();
    $("#average-wait").textContent = getAverageWait();
    $("#system-status").textContent = state.simTimer ? "Simulation Active" : "System Online";
    renderTable();
    renderQueue();
    renderActivity();
    renderMap();
    renderNetwork();
    renderCharts();
    renderJunctionCards();
    updateSimulationButtons();
    updateBanner();
    updateEmergencyOptions();
  }

  function updateBanner() {
    const winner = byId(state.selectedId);
    const banner = $("#system-banner");
    if (!winner) {
      $("#system-message").textContent = "No junctions in the network. Add a junction to begin.";
      banner.classList.remove("emergency-active");
      return;
    }
    const urgent = winner.emergency > 0;
    banner.classList.toggle("emergency-active", urgent);
    $("#system-message").textContent = urgent
      ? `Emergency priority active at ${winner.id}. Traffic signal adaptation is prioritizing emergency vehicles.`
      : `System is operating normally. ${winner.id} has the GREEN signal · ${calculatePriority(winner).full}.`;
  }

  function updateSimulationButtons() {
    const running = Boolean(state.simTimer);
    document.body.classList.toggle("simulation-running", running);
    ["#simulation-toggle", "#traffic-sim-toggle", "#settings-sim-toggle"].forEach(selector => {
      const button = $(selector);
      if (button) button.innerHTML = `<span class="button-dot"></span> ${running ? "Stop Simulation" : "Start Simulation"}`;
    });
  }

  function updateEmergencyOptions() {
    const select = $("#emergency-junction");
    const previousValue = select.value;
    select.innerHTML = state.junctions.map(junction => `<option value="${escapeHTML(junction.id)}">${escapeHTML(junction.name)} (${escapeHTML(junction.id)})</option>`).join("");
    if (byId(previousValue)) select.value = previousValue;
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "alert" ? "alert" : ""}`;
    toast.innerHTML = `<span>${type === "alert" ? "!" : "✓"}</span>${escapeHTML(message)}`;
    $("#toast-region").append(toast);
    window.setTimeout(() => toast.remove(), 3500);
  }

  function enqueueVehicle() {
    const junction = byId(state.selectedId);
    const token = state.nextToken++;
    const customers = ["Aarav", "Diya", "Ishaan", "Meera", "Kabir", "Anaya"];
    const customer = customers[(token - 106) % customers.length];
    state.queue.push({ token, customer, wait: junction ? junction.wait : 0 });
    if (junction) junction.cars += 1;
    recordActivity(`Vehicle token ${token} joined the ${state.selectedId || "network"} queue`, "blue");
    updateDashboard();
    showToast(`Vehicle ${token} added to the queue`);
  }

  function dequeueVehicle() {
    if (!state.queue.length) {
      showToast("The vehicle queue is already empty.", "alert");
      return;
    }
    const vehicle = state.queue.shift();
    const junction = byId(state.selectedId);
    if (junction) junction.cars = Math.max(0, junction.cars - 1);
    recordActivity(`Token ${vehicle.token} served from ${state.selectedId || "the queue"}`, "green");
    updateDashboard();
    showToast(`Vehicle ${vehicle.token - 100} passed`);
  }

  function startSimulation() {
    if (state.simTimer) return;
    state.emergencyLock = null;
    state.startedAt = Date.now();
    recordActivity("Traffic simulation started", "green");
    state.simTimer = window.setInterval(() => {
      state.junctions.forEach(junction => {
        junction.cars = Math.max(0, junction.cars + Math.floor(Math.random() * 13) - 5);
        junction.wait = Math.max(5, Math.min(180, junction.wait + Math.floor(Math.random() * 11) - 5));
      });
      state.queue = state.queue.map(vehicle => ({ ...vehicle, wait: Math.max(0, vehicle.wait + Math.floor(Math.random() * 7) - 2) }));
      recordActivity("Traffic conditions updated · priorities recalculated", "blue");
      updateDashboard();
    }, 2500);
    updateDashboard();
    showToast("Traffic simulation started");
  }

  function stopSimulation() {
    if (!state.simTimer) return;
    window.clearInterval(state.simTimer);
    state.simTimer = null;
    recordActivity("Traffic simulation stopped", "amber");
    updateDashboard();
    showToast("Traffic simulation stopped");
  }

  function toggleSimulation() {
    if (state.simTimer) stopSimulation();
    else startSimulation();
  }

  function showAddDialog() {
    $("#add-form-error").textContent = "";
    $("#add-junction-dialog").showModal();
  }

  function showEmergencyDialog() {
    if (!state.junctions.length) {
      showToast("Add a junction before simulating an emergency.", "alert");
      return;
    }
    updateEmergencyOptions();
    $("#emergency-junction").value = state.selectedId;
    $("#emergency-dialog").showModal();
  }

  function addJunction(form) {
    const data = new FormData(form);
    const rawName = String(data.get("name") || "").trim();
    const cars = Number(data.get("cars"));
    const emergency = Number(data.get("emergency"));
    const wait = Number(data.get("wait"));
    const error = $("#add-form-error");
    if (!rawName) { error.textContent = "Enter a junction name or ID."; return; }
    if ([cars, emergency, wait].some(value => !Number.isInteger(value) || value < 0)) { error.textContent = "Traffic values must be non-negative whole numbers."; return; }
    if (cars > 9999 || emergency > 999 || wait > 3600) { error.textContent = "Cars (max 9999), emergencies (max 999), or wait time (max 3600) exceed the allowed limit."; return; }
    const normalized = rawName.toLowerCase();
    if (state.junctions.some(junction => junction.id.toLowerCase() === normalized || junction.name.toLowerCase() === normalized)) {
      error.textContent = "A junction with that name or ID already exists.";
      return;
    }
    const id = /^j(?:unction\s*)?\d+$/i.test(rawName)
      ? `J${rawName.match(/\d+/)[0]}`
      : `J${state.generatedId++}`;
    if (state.junctions.some(junction => junction.id.toLowerCase() === id.toLowerCase())) {
      error.textContent = `${id} already exists. Choose another junction ID.`;
      return;
    }
    const direction = directionOrder.find(candidate => !state.junctions.some(junction => junction.direction === candidate)) || "East";
    const junction = { id, name: rawName.toLowerCase().startsWith("junction") ? rawName : `Junction ${rawName}`, direction, cars, emergency, wait };
    state.junctions.push(junction);
    state.emergencyLock = emergency > 0 ? junction.id : state.emergencyLock;
    recordActivity(`${junction.id} added to the traffic network`, "blue");
    recordActivity(`${junction.id} priority calculated · ${calculatePriority(junction).full}`, "purple");
    updateDashboard();
    $("#add-junction-dialog").close();
    form.reset();
    showToast(`${junction.id} added to the traffic network`);
  }

  function simulateEmergency(junctionId) {
    const junction = byId(junctionId);
    if (!junction) return;
    const previous = state.selectedId;
    junction.emergency += 1;
    state.emergencyLock = junction.id;
    recordActivity(`Emergency vehicle detected at ${junction.id}`, "red");
    recordActivity(`${junction.id} priority changed to Emergency`, "red");
    if (previous !== junction.id) recordActivity(`GREEN signal assigned to ${junction.id}`, "green");
    updateDashboard();
    showToast(`Emergency Vehicle Detected! Traffic signal priority changed automatically to ${junction.id}.`, "alert");
    $("#emergency-dialog").close();
  }

  function resetSystem() {
    if (state.simTimer) window.clearInterval(state.simTimer);
    if (state.transitionTimer) window.clearTimeout(state.transitionTimer);
    state.simTimer = null;
    state.transitionTimer = null;
    state.transitionId = null;
    state.junctions = originalJunctions.map(item => ({ ...item }));
    state.queue = initialQueue.map(item => ({ ...item }));
    state.selectedId = "J1";
    state.lastSelectedId = null;
    state.emergencyLock = null;
    state.generatedId = 5;
    state.nextToken = 106;
    state.activities = [];
    [
      "System reset to original sample data",
      "GREEN signal assigned to J1",
      "Priority recalculated · J1 receives Emergency Priority"
    ].forEach(text => recordActivity(text, "blue"));
    updateDashboard();
    showToast("System reset to original sample data");
  }

  function navigate(view) {
    $$(".view-panel").forEach(panel => panel.classList.toggle("is-active", panel.id === `view-${view}`));
    $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $("#sidebar").classList.remove("is-open");
    $("#mobile-menu").setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setClock() {
    const now = new Date();
    $("#current-date").textContent = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    $("#current-time").textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  $$(".nav-item").forEach(button => button.addEventListener("click", () => navigate(button.dataset.view)));
  $$("[data-navigate]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.navigate)));
  $("#mobile-menu").addEventListener("click", () => {
    const open = $("#sidebar").classList.toggle("is-open");
    $("#mobile-menu").setAttribute("aria-expanded", String(open));
  });
  ["#simulation-toggle", "#traffic-sim-toggle", "#settings-sim-toggle"].forEach(selector => $(selector).addEventListener("click", toggleSimulation));
  ["#add-junction-open", "[data-open-add]"].forEach(selector => $$(selector).forEach(button => button.addEventListener("click", showAddDialog)));
  ["#emergency-open", "[data-open-emergency]"].forEach(selector => $$(selector).forEach(button => button.addEventListener("click", showEmergencyDialog)));
  ["#reset-system", "[data-reset]"].forEach(selector => $$(selector).forEach(button => button.addEventListener("click", resetSystem)));
  ["#enqueue-vehicle", "#traffic-enqueue"].forEach(selector => $(selector).addEventListener("click", enqueueVehicle));
  ["#dequeue-vehicle", "#traffic-dequeue"].forEach(selector => $(selector).addEventListener("click", dequeueVehicle));
  $("#clear-queue").addEventListener("click", () => {
    const count = state.queue.length;
    state.queue = [];
    recordActivity(`Vehicle queue cleared · ${count} vehicle${count === 1 ? "" : "s"} removed`, "amber");
    updateDashboard();
    showToast("Vehicle queue cleared");
  });
  $$("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  $("#add-junction-form").addEventListener("submit", event => {
    event.preventDefault();
    addJunction(event.currentTarget);
  });
  $("#emergency-form").addEventListener("submit", event => {
    event.preventDefault();
    simulateEmergency($("#emergency-junction").value);
  });
  $("#banner-close").addEventListener("click", () => $("#system-banner").hidden = true);

  setClock();
  window.setInterval(setClock, 30000);
  updateDashboard();
})();
