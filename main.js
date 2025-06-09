
// === FETCH JSON ===
let data;

async function fetchData() {
  const response = await fetch("pitch_data.json");
  data = await response.json();
  populateDropdowns();
}

function populateDropdowns() {
  const teamSelect = document.getElementById("team-select");
  const pitcherSelect = document.getElementById("pitcher-select");
  const pitchCheckboxes = document.getElementById("pitch-checkboxes");

  teamSelect.innerHTML = "";
  pitcherSelect.innerHTML = "";
  pitchCheckboxes.innerHTML = "";

  Object.keys(data).sort().forEach(team => {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    teamSelect.appendChild(option);
  });

  teamSelect.addEventListener("change", () => {
    const team = teamSelect.value;
    pitcherSelect.innerHTML = "";
    Object.keys(data[team]).sort().forEach(pitcher => {
      const opt = document.createElement('option');
      opt.value = pitcher;
      opt.textContent = pitcher;
      pitcherSelect.appendChild(opt);
    });

    pitcherSelect.dispatchEvent(new Event("change"));
  });

  pitcherSelect.addEventListener("change", () => {
    const team = teamSelect.value;
    const pitcher = pitcherSelect.value;
    pitchCheckboxes.innerHTML = "";
    if (!data[team] || !data[team][pitcher]) return;
    const keys = Object.keys(data[team][pitcher]);
    const pitchMap = {};

    keys.forEach(key => {
      const [type, zone] = key.split(" ");
      if (!pitchMap[type]) pitchMap[type] = [];
      pitchMap[type].push(zone);
    });

    Object.entries(pitchMap).forEach(([type, zones]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "pitch-type-section";

      const label = document.createElement("label");
      label.textContent = type;
      wrapper.appendChild(label);

      const grid = document.createElement("div");
      grid.className = "zone-grid";

      zones.sort((a, b) => a - b).forEach(zone => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `${type}-${zone}`;
        checkbox.value = `${type} ${zone}`;
        checkbox.className = "pitch-checkbox";

        const checkboxLabel = document.createElement("label");
        checkboxLabel.htmlFor = `${type}-${zone}`;
        checkboxLabel.textContent = zone;

        const box = document.createElement("div");
        box.className = "checkbox-wrapper";
        box.appendChild(checkbox);
        box.appendChild(checkboxLabel);

        grid.appendChild(box);
      });

      wrapper.appendChild(grid);
      pitchCheckboxes.appendChild(wrapper);
    });
  });

  teamSelect.dispatchEvent(new Event("change"));
}

fetchData();
