var addParticipant = function(person) {
  var cityInput = document.getElementById("City");
  var city = cityInput ? cityInput.value : "";
  var newP = document.createElement("p");
  newP.textContent = "🎟️ " + person.name + " from " + city + " has RSVP'd.";
  var rsvpList = document.querySelector(".rsvp-participants");
  if (rsvpList) rsvpList.appendChild(newP);
};

var rsvpButton = document.getElementById("rsvp-button");
if (rsvpButton) {
  rsvpButton.addEventListener("click", function(event) {
    event.preventDefault();
    validateForm();
  });
}

/*** Form Validation ***/
var validateForm = function() {
  var containsErrors = false;
  var rsvpInputs = document.getElementById("rsvp-form").elements;

  for (var i = 0; i < rsvpInputs.length; i++) {
    var input = rsvpInputs[i];
    if (input.value.trim().length < 2) {
      containsErrors = true;
      input.classList.add("error");
    } else {
      input.classList.remove("error");
    }
  }

  var emailEl = document.getElementById("Email");
  var emailPattern = /^[^@]+@[^@]+\.[a-z]{2,}$/i;
  if (!emailPattern.test(emailEl.value.trim())) {
    containsErrors = true;
    emailEl.classList.add("error");
  } else {
    emailEl.classList.remove("error");
  }

  if (!containsErrors) {
    var person = {
      name: document.getElementById("Name").value.trim(),
      email: document.getElementById("Email").value.trim(),
      city: document.getElementById("City").value.trim()
    };
    toggleSuccessModal(person);
    addParticipant(person);
  }
  document.getElementById("rsvp-form").reset();
};

/*** Modal ***/
document.addEventListener("DOMContentLoaded", function() {
  var modal = document.getElementById("success-modal");
  var closeModalBtn = document.getElementById("close-modal-btn");
  if (modal && closeModalBtn) {
    closeModalBtn.addEventListener("click", function() {
      modal.style.display = "none";
    });
  }
});

var toggleSuccessModal = function(person) {
  var modal = document.getElementById("success-modal");
  var modalText = document.getElementById("modal-text");
  if (!modal || !modalText) return;
  modal.style.display = "flex";
  modalText.textContent = "Thank you, " + person.name + " for RSVPing!";
  var intervalId = setInterval(animateModalImage, 500);
  setTimeout(function() {
    modal.style.display = "none";
    clearInterval(intervalId);
  }, 5000);
};

var rotateFactor = 0;
var animateModalImage = function() {
  var modalImage = document.getElementById("modal-image");
  if (!modalImage) return;
  rotateFactor = rotateFactor === 0 ? -10 : 0;
  modalImage.style.transform = "rotate(" + rotateFactor + "deg)";
};

/*** Reduce Motion ***/
document.addEventListener("DOMContentLoaded", function() {
  var btn = document.getElementById("motion-btn");
  if (btn) {
    btn.addEventListener("click", function() {
      document.body.classList.toggle("reduce-motion");
    });
  }
});

/*** Route Color Map ***/
var ROUTE_COLORS = {
  "A":   "#0072BC",
  "B":   "#E3001B",
  "C":   "#12853A",
  "D":   "#6D2E8C",
  "E":   "#0072BC",
  "G":   "#F47321",
  "J":   "#939598",
  "K":   "#6D2E8C",
  "L":   "#F5A623",
  "801": "#0072BC",
  "802": "#E3001B",
  "803": "#12853A",
  "804": "#6D2E8C",
  "805": "#0072BC",
  "806": "#6D2E8C",
  "807": "#F5A623"
};

function getRouteChip(routeId) {
  var id = String(routeId).toUpperCase().trim();
  var color = ROUTE_COLORS[id] || "#0072BC";
  return '<span class="route-chip" style="background:' + color + '">' + id + '</span>';
}

/*** Metro API — real route data ***/
var METRO_API = "https://api.metro.net";
var metroRoutes = [];

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

async function loadMetroRoutes() {
  var status = document.getElementById("api-status");
  try {
    var responses = await Promise.all([
      fetch(METRO_API + "/LACMTA/route_overview"),
      fetch(METRO_API + "/LACMTA_Rail/route_overview")
    ]);
    var sets = await Promise.all(responses.map(function(r) { return r.json(); }));
    metroRoutes = sets[0].concat(sets[1]);

    var list = document.getElementById("route-list");
    if (list) {
      list.innerHTML = metroRoutes.map(function(r) {
        return '<option value="' + esc(r.route_code) + '">';
      }).join("");
    }
    if (status) {
      status.textContent = metroRoutes.length + " Metro routes loaded · data from api.metro.net";
    }
  } catch (e) {
    if (status) status.textContent = "Could not reach Metro route data.";
  }
}
loadMetroRoutes();

function findRoutes(query) {
  var q = String(query).trim().toLowerCase();
  if (!q) return [];
  var exact = metroRoutes.filter(function(r) {
    return String(r.route_code).toLowerCase() === q;
  });
  if (exact.length) return exact;
  return metroRoutes.filter(function(r) {
    return String(r.route_code).toLowerCase().indexOf(q) !== -1 ||
           String(r.long_name || "").toLowerCase().indexOf(q) !== -1 ||
           String(r.route_short_name || "").toLowerCase().indexOf(q) !== -1;
  }).slice(0, 8);
}

function renderRoute(r) {
  var color = r.route_color ? "#" + r.route_color : "#0072BC";
  var textColor = r.route_text_color ? "#" + r.route_text_color : "#FFFFFF";
  var name = r.long_name || r.route_short_name || r.route_code;
  var desc = r.description || r.route_desc || "";

  var links = "";
  if (r.route_url) {
    links += '<a href="' + esc(r.route_url) + '" target="_blank">Line guide ↗</a>';
  }
  if (r.pdf_file_url) {
    links += '<a href="' + esc(r.pdf_file_url) + '" target="_blank">Timetable PDF ↗</a>';
  }
  links += '<a href="https://www.metro.net/riding/service-alerts/" target="_blank">Service alerts ↗</a>';

  return '<div class="route-card">' +
    '<span class="route-chip" style="background:' + esc(color) + ';color:' + esc(textColor) + '">' +
      esc(r.route_code) + '</span>' +
    '<div class="route-card-body">' +
      '<div class="route-card-name">' + esc(name) + '</div>' +
      '<div class="route-card-desc">' + esc(desc) + '</div>' +
      '<div class="route-card-links">' + links + '</div>' +
    '</div>' +
  '</div>';
}

/*** Widget tabs ***/
var tabTrip = document.getElementById("tab-trip");
var tabRoute = document.getElementById("tab-route");
var panelTrip = document.getElementById("panel-trip");
var panelRoute = document.getElementById("panel-route");

if (tabTrip && tabRoute) {
  tabTrip.addEventListener("click", function() {
    tabTrip.classList.add("active");
    tabRoute.classList.remove("active");
    panelTrip.hidden = false;
    panelRoute.hidden = true;
  });
  tabRoute.addEventListener("click", function() {
    tabRoute.classList.add("active");
    tabTrip.classList.remove("active");
    panelRoute.hidden = false;
    panelTrip.hidden = true;
  });
}

/*** Trip planner ***/
var tripGo = document.getElementById("trip-go");
var tripSwap = document.getElementById("trip-swap");

if (tripGo) {
  tripGo.addEventListener("click", function() {
    var from = document.getElementById("trip-from").value.trim();
    var to = document.getElementById("trip-to").value.trim();
    var note = document.getElementById("trip-note");

    if (!from || !to) {
      note.textContent = "Enter both a departure and a destination.";
      note.classList.add("err");
      return;
    }
    note.classList.remove("err");
    note.textContent = "Opening transit directions in a new tab…";

    var url = "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(from) +
      "&destination=" + encodeURIComponent(to) +
      "&travelmode=transit";
    window.open(url, "_blank");
  });
}

if (tripSwap) {
  tripSwap.addEventListener("click", function() {
    var a = document.getElementById("trip-from");
    var b = document.getElementById("trip-to");
    var tmp = a.value; a.value = b.value; b.value = tmp;
  });
}

/*** Route finder ***/
var routeGo = document.getElementById("route-go");
var routeInput = document.getElementById("route-input");

function runRouteSearch() {
  var box = document.getElementById("route-results");
  var q = routeInput.value.trim();

  if (!q) {
    box.innerHTML = '<p class="results-error">Enter a route number or line name.</p>';
    box.classList.add("visible");
    return;
  }
  if (!metroRoutes.length) {
    box.innerHTML = '<p class="results-empty">Route data still loading — try again in a moment.</p>';
    box.classList.add("visible");
    return;
  }

  var hits = findRoutes(q);
  box.innerHTML = hits.length
    ? '<div class="results-header"><span class="results-title">' + hits.length +
      ' route' + (hits.length > 1 ? 's' : '') + ' found</span></div>' +
      hits.map(renderRoute).join("")
    : '<p class="results-empty">No route matches "' + esc(q) + '".</p>';
  box.classList.add("visible");
}

if (routeGo) routeGo.addEventListener("click", runRouteSearch);
if (routeInput) {
  routeInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") runRouteSearch();
  });
}


/*** Food Access Resources ***/
document.querySelectorAll(".food-tab").forEach(function(tab) {
  tab.addEventListener("click", function() {
    document.querySelectorAll(".food-tab").forEach(function(t) { t.classList.remove("active"); });
    tab.classList.add("active");
    document.querySelectorAll(".food-panel").forEach(function(p) { p.style.display = "none"; });
    document.getElementById(tab.dataset.tab + "-panel").style.display = "block";
  });
});

var foodSearchBtn = document.getElementById("food-search-btn");
if (foodSearchBtn) {
  foodSearchBtn.addEventListener("click", function() {
    var zip = document.getElementById("zip-input").value.trim();
    if (!zip || !/^\d{5}$/.test(zip)) {
      document.getElementById("snap-panel").innerHTML = '<p class="food-error">Please enter a valid 5-digit zip code.</p>';
      return;
    }
    var activeTab = document.querySelector(".food-tab.active").dataset.tab;
    if (activeTab === "snap")    loadSnapStores(zip);
    if (activeTab === "markets") loadFarmersMarkets(zip);
  });
}

function loadSnapStores(zip) {
  document.getElementById("snap-panel").innerHTML =
    '<div class="snap-link-card">' +
      '<p>The USDA SNAP Store Locator lists all EBT-accepting retailers near <strong>' + zip + '</strong>.</p>' +
      '<button onclick="window.open(\'https://www.fns.usda.gov/snap/retailer-locator\', \'_blank\')">Find SNAP Stores Near ' + zip + '</button>' +
    '</div>';
}

function loadFarmersMarkets(zip) {
  document.getElementById("markets-panel").innerHTML =
    '<div class="snap-link-card">' +
      '<p>The USDA Local Food Directory lists <strong>farmers markets near ' + esc(zip) +
      '</strong>, including which accept EBT/SNAP and WIC.</p>' +
      '<button onclick="window.open(\'https://www.usdalocalfoodportal.com/fe/fdirectory_farmersmarket/?zip=' +
      encodeURIComponent(zip) + '\', \'_blank\')">🌽 Find Farmers Markets Near ' + esc(zip) + '</button>' +
    '</div>';
}

/*** Alerts Bar dismiss ***/
var alertClose = document.getElementById("alert-close");
var alertsBar = document.getElementById("alerts-bar");
if (alertClose && alertsBar) {
  alertClose.addEventListener("click", function() {
    alertsBar.style.display = "none";
    document.querySelector(".hero").style.paddingTop = "120px";
  });
}
