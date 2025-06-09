
// === CONSTANTS ===
const zoneIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const pitchColors = {
    "FF": "#FF0000", "SL": "#0000FF", "CH": "#00FF00", "CU": "#800080", "SI": "#FFA500",
    "FC": "#00CED1", "FS": "#8B0000", "KC": "#4B0082", "KN": "#A52A2A", "EP": "#DA70D6",
    "FO": "#B22222", "SC": "#FF69B4", "GY": "#2E8B57", "UN": "#808080"
};

let pitchData = {};
let currentTeam = null;
let currentPitcher = null;
let activePitches = new Set();
let scene, camera, renderer;

// === LOAD DATA ===
fetch("pitch_data.json")
    .then(response => response.json())
    .then(data => {
        pitchData = data;
        populateTeams();
        animate();
    });

// === UI SETUP ===
function populateTeams() {
    const teamSelect = document.getElementById("team-select");
    teamSelect.innerHTML = "";

    Object.keys(pitchData).sort().forEach(team => {
        const option = document.createElement("option");
        option.value = team;
        option.text = team;
        teamSelect.appendChild(option);
    });

    teamSelect.addEventListener("change", () => {
        currentTeam = teamSelect.value;
        populatePitchers();
    });

    teamSelect.value = Object.keys(pitchData)[0];
    teamSelect.dispatchEvent(new Event("change"));
}

function populatePitchers() {
    const pitcherSelect = document.getElementById("pitcher-select");
    pitcherSelect.innerHTML = "";

    const pitchers = Object.keys(pitchData[currentTeam] || {}).sort();
    pitchers.forEach(pitcher => {
        const option = document.createElement("option");
        option.value = pitcher;
        option.text = pitcher;
        pitcherSelect.appendChild(option);
    });

    pitcherSelect.addEventListener("change", () => {
        currentPitcher = pitcherSelect.value;
        populateCheckboxes();
    });

    if (pitchers.length > 0) {
        pitcherSelect.value = pitchers[0];
        pitcherSelect.dispatchEvent(new Event("change"));
    }
}

function populateCheckboxes() {
    const checkboxContainer = document.getElementById("checkboxes");
    checkboxContainer.innerHTML = "";

    const pitchKeys = Object.keys(pitchData[currentTeam][currentPitcher] || {}).sort((a, b) => {
        const [typeA, zoneA] = a.split(" ");
        const [typeB, zoneB] = b.split(" ");
        return typeA.localeCompare(typeB) || zoneA - zoneB;
    });

    const pitchMap = {};

    pitchKeys.forEach(key => {
        const [pitchType, zone] = key.split(" ");
        if (!pitchMap[pitchType]) pitchMap[pitchType] = [];
        pitchMap[pitchType].push(zone);
    });

    Object.keys(pitchMap).forEach(pitchType => {
        const wrapper = document.createElement("div");
        wrapper.className = "pitch-group";

        const label = document.createElement("div");
        label.className = "pitch-label";
        label.innerText = pitchType;
        wrapper.appendChild(label);

        const grid = document.createElement("div");
        grid.className = "grid";

        pitchMap[pitchType].forEach(zone => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `${pitchType}-${zone}`;
            checkbox.dataset.key = `${pitchType} ${zone}`;
            checkbox.addEventListener("change", (e) => {
                const key = e.target.dataset.key;
                if (e.target.checked) {
                    activePitches.add(key);
                } else {
                    activePitches.delete(key);
                }
                drawScene();
            });

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.innerText = zone;

            const cell = document.createElement("div");
            cell.className = "cell";
            cell.appendChild(checkbox);
            cell.appendChild(label);
            grid.appendChild(cell);
        });

        wrapper.appendChild(grid);
        checkboxContainer.appendChild(wrapper);
    });
}

// === THREE.JS SETUP ===
function animate() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    drawScene();
}

function drawScene() {
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    activePitches.forEach(key => {
        const [pitchType, zone] = key.split(" ");
        const data = pitchData[currentTeam][currentPitcher][key];
        const points = [];

        let x = data.release_pos_x;
        let y = data.release_pos_y;
        let z = data.release_pos_z;

        let vx = data.vx0;
        let vy = data.vy0;
        let vz = data.vz0;

        let ax = data.ax;
        let ay = data.ay;
        let az = data.az;

        for (let t = 0; t <= 0.45; t += 0.01) {
            const px = x + vx * t + 0.5 * ax * t * t;
            const py = y + vy * t + 0.5 * ay * t * t;
            const pz = z + vz * t + 0.5 * az * t * t;
            points.push(new THREE.Vector3(px, py, pz));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: pitchColors[pitchType] || "#FFFFFF" });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    });

    renderer.render(scene, camera);
}
