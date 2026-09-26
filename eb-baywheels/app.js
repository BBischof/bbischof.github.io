const STATUS_URL = "https://gbfs.lyft.com/gbfs/2.3/bay/en/station_status.json";
const STORAGE_KEY = "eb-baywheels-progress-v1";

const $ = (id) => document.getElementById(id);
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  index: 0, visited: [], startedAt: null, elapsedMs: 0, paused: false
};

let stations = [];
let map;
let markers = [];
let routeLine;
let activeLine;
let directions;
let userMarker;
let watchId;
let statusById = new Map();
let showingOverview = false;

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const rad = (n) => n * Math.PI / 180;
function meters(a, b) {
  const p1 = rad(a.lat), p2 = rad(b.lat), dlat = p2-p1, dlon = rad(b.lon-a.lon);
  const h = Math.sin(dlat/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dlon/2)**2;
  return 12742000 * Math.asin(Math.sqrt(h));
}
function formatDistance(m) { return m < 1609 ? `${Math.round(m / 10) * 10} m` : `${(m / 1609.344).toFixed(1)} mi`; }
function elapsed() { return state.elapsedMs + (state.startedAt && !state.paused ? Date.now() - state.startedAt : 0); }
function formatTime(ms) {
  const total = Math.floor(ms / 1000), h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
  return h ? `${h}h ${String(m).padStart(2,"0")}m` : `${m}:${String(s).padStart(2,"0")}`;
}

function markerIcon(index) {
  const current = index === state.index;
  const next = index === state.index + 1;
  const visited = state.visited.includes(index);
  return L.divIcon({ className:`station-marker${current ? " current" : next ? " next" : visited ? " visited" : ""}`, html:String(index+1), iconSize:current?[24,24]:next?[20,20]:[14,14] });
}

function initMap() {
  map = L.map("map", { zoomControl:false, attributionControl:true, preferCanvas:true });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  const routedCoordinates = directions?.legs.flatMap((leg,i)=>i ? leg.coordinates.slice(1) : leg.coordinates);
  routeLine = L.polyline(routedCoordinates || stations.map(s => [s.lat,s.lon]), { color:"#55504b", weight:3, opacity:.34, lineCap:"round", lineJoin:"round" }).addTo(map);
  activeLine = L.polyline([], { color:"#ee5b3c", weight:7, opacity:.98, lineCap:"round", lineJoin:"round" }).addTo(map);
  markers = stations.map((s,i) => L.marker([s.lat,s.lon], {icon:markerIcon(i), zIndexOffset:i===state.index?1000:0}).bindTooltip(s.name).on("click",()=>selectStation(i)).addTo(map));
  map.fitBounds(routeLine.getBounds(), {padding:[35,35]});
}

function selectStation(index) {
  state.index = Math.max(0, Math.min(index, stations.length-1));
  save();
  showingOverview = false;
  render(true);
  $("stationDialog").close();
}

function render(center=false) {
  const s = stations[state.index];
  if (!s) return;
  const hasNext = state.index < stations.length - 1;
  const next = hasNext ? stations[state.index + 1] : s;
  $("stationCount").textContent = `${state.index+1} / ${stations.length}`;
  $("stationName").textContent = s.name;
  $("nextStation").textContent = next.name;
  const leg = directions?.legs[state.index];
  $("distance").textContent = leg ? formatDistance(leg.distanceMeters) : hasNext ? formatDistance(meters(s,next)) : "Finish";
  const status = statusById.get(next.id);
  $("ebikes").textContent = status?.num_ebikes_available ?? "—";
  $("classic").textContent = status ? Math.max(0, status.num_bikes_available - (status.num_ebikes_available || 0)) : "—";
  $("docks").textContent = status?.num_docks_available ?? "—";
  $("rideButton").disabled = false;
  $("rideButton").textContent = state.paused && state.elapsedMs ? "Resume ride" : !state.startedAt && !state.elapsedMs ? "Start ride" : state.index === stations.length-1 ? "Finish ride" : "Log dock & next";
  $("backButton").disabled = state.index === 0;
  $("pauseButton").disabled = !state.startedAt && !state.elapsedMs;
  $("pauseButton").textContent = state.paused ? "Resume ride" : "Pause ride";
  markers.forEach((m,i)=>{ m.setIcon(markerIcon(i)); m.setZIndexOffset(i===state.index?1000:0); });
  const activeCoordinates = leg?.coordinates || (hasNext ? [[s.lat,s.lon],[next.lat,next.lon]] : [[s.lat,s.lon]]);
  activeLine.setLatLngs(activeCoordinates);
  if (center && $("autoCenter").checked) focusActiveSegment();
  renderHistory();
}

function focusActiveSegment() {
  showingOverview = false;
  const bounds = activeLine.getBounds();
  if (bounds.isValid()) map.flyToBounds(bounds, {paddingTopLeft:[55,90],paddingBottomRight:[55,250],maxZoom:17,duration:.5});
  $("sheetHandle").setAttribute("aria-label","Show full route");
}

function toggleMapFocus() {
  if (showingOverview) focusActiveSegment();
  else {
    showingOverview = true;
    map.flyToBounds(routeLine.getBounds(), {padding:[35,35],duration:.55});
    $("sheetHandle").setAttribute("aria-label","Show current segment");
  }
}

function completeDock() {
  if (state.paused && state.elapsedMs) { resumeRide(); return; }
  if (!state.startedAt && !state.elapsedMs) state.startedAt = Date.now();
  if (!state.visited.includes(state.index)) state.visited.push(state.index);
  if (state.index < stations.length-1) state.index++;
  else { state.elapsedMs = elapsed(); state.startedAt = null; state.paused = true; }
  save(); render(true);
}

function undoLastDock() {
  if (state.index === 0) return;
  const previousIndex = state.index - 1;
  state.index = previousIndex;
  state.visited = state.visited.filter(index => index !== previousIndex);
  save();
  showingOverview = false;
  render(true);
}

function pauseRide() {
  if (!state.startedAt && !state.elapsedMs) return;
  if (state.paused) { resumeRide(); return; }
  state.elapsedMs = elapsed();
  state.startedAt = null;
  state.paused = true;
  save(); render(false);
}

function resumeRide() {
  state.startedAt = Date.now();
  state.paused = false;
  save(); render(false);
}

async function refreshStatus() {
  try {
    const response = await fetch(STATUS_URL, {cache:"no-store"});
    const data = await response.json();
    statusById = new Map(data.data.stations.map(s=>[String(s.station_id),s]));
    render(false);
  } catch { $("availability").title = "Live availability is temporarily unavailable"; }
}

function renderList(query="") {
  const q=query.trim().toLowerCase();
  $("stationList").replaceChildren(...stations.map((s,i)=>({s,i})).filter(x=>!q||x.s.name.toLowerCase().includes(q)).map(({s,i})=>{
    const li=document.createElement("li"), button=document.createElement("button");
    button.type="button"; button.innerHTML=`<span>${i+1}</span><strong>${s.name}</strong>`; button.onclick=()=>selectStation(i); li.append(button); return li;
  }));
}

function renderHistory() {
  const done=state.visited.length, percent=Math.round(done/stations.length*100);
  const climb=directions ? `<span>${Math.round(directions.ascentMeters*3.28084).toLocaleString()} ft total climbing</span>` : "";
  $("historySummary").innerHTML=`<strong>${done} of ${stations.length} docks · ${percent}%</strong><span>${formatTime(elapsed())} ride time</span>${climb}<span>${stations.length-done} stations remaining</span>`;
}

function toggleLocation() {
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId=null; $("locateButton").textContent="◎"; return; }
  if (!navigator.geolocation) return;
  watchId=navigator.geolocation.watchPosition(({coords})=>{
    const latlng=[coords.latitude,coords.longitude];
    if (!userMarker) userMarker=L.marker(latlng,{icon:L.divIcon({className:"user-location",iconSize:[18,18]})}).addTo(map);
    else userMarker.setLatLng(latlng);
    map.panTo(latlng); $("locateButton").textContent="◉";
  },()=>{ $("locateButton").textContent="⊘"; },{enableHighAccuracy:true,maximumAge:5000});
}

function bindEvents() {
  $("stationPicker").onclick=()=>{ renderList(); $("stationDialog").showModal(); setTimeout(()=>$("stationSearch").focus(),50); };
  $("stationSearch").oninput=e=>renderList(e.target.value);
  $("rideButton").onclick=completeDock;
  $("backButton").onclick=undoLastDock;
  $("locateButton").onclick=toggleLocation;
  $("historyButton").onclick=()=>$("historyDialog").showModal();
  $("settingsButton").onclick=()=>$("settingsDialog").showModal();
  $("pauseButton").onclick=pauseRide;
  $("sheetHandle").onclick=toggleMapFocus;
  $("showRoute").onchange=e=>e.target.checked?routeLine.addTo(map):routeLine.remove();
  $("resetButton").onclick=()=>{ Object.assign(state,{index:0,visited:[],startedAt:null,elapsedMs:0,paused:false}); save(); $("historyDialog").close(); render(true); };
}

async function boot() {
  const response=await fetch("stations.json");
  const data=await response.json(); stations=data.stations;
  directions=await fetch("directions.json").then(r=>r.ok?r.json():null).catch(()=>null);
  if (state.index>=stations.length) state.index=0;
  initMap(); bindEvents(); render(true); refreshStatus();
  setInterval(refreshStatus,60000);
  const routeMiles=directions ? `${(directions.distanceMeters/1609.344).toFixed(1)} mi route` : `${data.distanceKm} km route`;
  setInterval(()=>{ $("timer").textContent=state.startedAt||state.elapsedMs ? formatTime(elapsed()) : routeMiles; renderHistory(); },1000);
}
boot().catch(error=>{ $("stationName").textContent="Could not load route"; console.error(error); });
