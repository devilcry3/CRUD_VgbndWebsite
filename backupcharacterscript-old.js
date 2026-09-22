<script>
        let generatedGuidedCharacter = null;   // NEW
        let generatedRandomCharacter = null;   // NEW


        // ==========================
        // GENERATOR
        // ==========================
        function generateCharacterName({ ancestry, className, archetype }) {

            const style = NAME_STYLES[ancestry] || NAME_STYLES.human;

            const pick = arr => arr[Math.floor(Math.random() * arr.length)];

            const name =
                pick(style.start) +
                pick(style.mid) +
                pick(style.end);

            let title = null;

            // 40% archetype-based title
            if (Math.random() < 0.4) {
                title = getArchetypeTitle(archetype);
            }

            // fallback class tone
            if (!title && CLASS_TONES[className]) {
                title = pick(CLASS_TONES[className]);
            }

            // final fallback
            if (!title) {
                title = "the Wanderer";
            }

            return `${name}, ${title}`;
        };

        function getArchetypeTitle(archetypeName) {
            if (!archetypeName || !DB_ARCHETYPES[archetypeName]) {
                return null;
            }

            const titles = {
                Assassin: ["the Silent Fang", "Knife in the Dark", "the Pale Blade"],
                Knight: ["of the Oath", "Iron-Warded", "the Valiant"],
                Mage: ["of the Veil", "Star-Scribed", "Arcane Bound"],
                Warrior: ["the Unbroken", "Bloodforged", "Iron Soul"],
                Scout: ["Windstep", "Eyes of the Wild", "Far Strider"],
                Spy: ["the Faceless", "Shadow of Courts", "Hidden Tongue"],
                Default: ["the Wanderer", "the Drifter", "of Unknown Paths"]
            };

            const list = titles[archetypeName] || titles.Default;

            return list[Math.floor(Math.random() * list.length)];
        };

        //-------------------------------------------------
        //-------------------------------------------------
        //--Table GET FOR DROPDOWNS
        //-------------------------------------------------
        //-------------------------------------------------

        let DB_CLASS = {};
        fetch("http://localhost/classes/", { method: 'GET' })
            .then((response) => {
                return new Promise((resolve) => response.json()
                    .then((json) => resolve({
                        status: response.status,
                        json,
                    })
                    ));
            })
            .then(({ status, json }) => {
                if (200 === status) {
                    const classDropDown = document.getElementById('guided-class');

                    for (classes of json.data) {
                        DB_CLASS[classes.id] = classes.class;

                        let option = document.createElement("option");
                        option.value = classes.id;
                        option.text = classes.class + ' | ROLE: ' + classes.role;
                        classDropDown.add(option);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        let DB_ANCESTRIES = {};
        fetch("http://localhost/ancestry/", { method: 'GET' })
            .then((response) => {
                return new Promise((resolve) => response.json()
                    .then((json) => resolve({
                        status: response.status,
                        json,
                    })
                    ));
            })
            .then(({ status, json }) => {
                if (200 === status) {
                    const ancestryDropDown = document.getElementById('guided-ancestry');

                    for (ancestry of json.data) {
                        DB_ANCESTRIES[ancestry.id] = ancestry.ancestry;

                        let option = document.createElement("option");
                        option.value = ancestry.id;
                        option.text = ancestry.ancestry + ' | TYPE: ' + ancestry.ancestry_type;
                        ancestryDropDown.add(option);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        let DB_ARCHETYPES = {};

        function loadArchetypes() {
            fetch("http://localhost/archetypes/", { method: 'GET' })
                .then(response => response.json())
                .then(json => {

                    json.data.forEach(item => {

                        const arctype = item.archetype;

                        if (arctype) {
                            DB_ARCHETYPES[arctype] = {
                                id: item.id,
                                name: arctype,
                                gear: [
                                    item.slot_1, item.slot_2, item.slot_3,
                                    item.slot_4, item.slot_5, item.slot_6, item.slot_7
                                ].filter(slot => slot),
                                currency: (item.gold || 0) + "g " + (item.silver || 0) + "s " + (item.copper || 0) + "c"
                            };
                        }
                    });

                    updateArchetypeDropdown();
                })
                .catch(error => console.error('Error loading archetypes:', error));
        };
        loadArchetypes();

        function renderSwapEditor(stats) {
            const container = document.getElementById("stat-editor");
            container.innerHTML = "";

            ABILITIES.forEach((ability, index) => {

                const row = document.createElement("div");
                row.className = "d-flex align-items-center mb-2";

                const label = document.createElement("div");
                label.style.width = "120px";
                label.innerText = ability;

                const select = document.createElement("select");
                select.className = "form-select";

                stats.forEach(value => {
                    const option = document.createElement("option");
                    option.value = value;
                    option.text = value;

                    if (value === stats[index]) {
                        option.selected = true;
                    }

                    select.appendChild(option);
                });

                select.addEventListener("change", () => {

                    const newValue = parseInt(select.value);
                    const oldValue = stats[index];

                    const swapIndex = stats.findIndex((v, i) => v === newValue && i !== index);

                    if (swapIndex !== -1) {
                        stats[swapIndex] = oldValue;
                    }

                    stats[index] = newValue;

                    currentGuidedStats = [...stats];

                    renderSwapEditor(currentGuidedStats);
                    updateDerived(currentGuidedStats);
                });

                row.appendChild(label);
                row.appendChild(select);
                container.appendChild(row);
            });
        }

        const errorBanner = document.getElementById('invalid-form');
        errorBanner.hidden = true;

        const slider = document.getElementById('level-slider');
        const output = document.getElementById('level-value');
        slider.addEventListener('input', () => output.textContent = slider.value);

        function updateArchetypeDropdown() {
            const classSelect = document.getElementById("guided-class");
            const archetypeSelect = document.getElementById("guided-archetype");

            archetypeSelect.innerHTML = "";

            const selectedClass = classSelect.value;
            const suggested = CLASS_SUGGESTIONS[selectedClass] || [];
            const allNames = Object.keys(DB_ARCHETYPES);

            suggested.forEach(arctype => {
                if (DB_ARCHETYPES[arctype]) {
                    const opt = document.createElement("option");
                    opt.value = DB_ARCHETYPES[arctype].id;
                    opt.textContent = arctype;
                    archetypeSelect.appendChild(opt);
                }
            });

            const divider = document.createElement("option");
            divider.disabled = true;
            divider.textContent = "────────────";
            archetypeSelect.appendChild(divider);

            allNames.forEach(arctype => {
                if (!suggested.includes(arctype)) {
                    const opt = document.createElement("option");
                    opt.value = DB_ARCHETYPES[arctype].id;
                    opt.textContent = arctype;
                    archetypeSelect.appendChild(opt);
                }
            });
        }

        document.getElementById("guided-class").addEventListener("change", updateArchetypeDropdown);
        updateArchetypeDropdown();

        function assignStatsByClass(statArray, charClass) {
            const sorted = [...statArray].sort((a, b) => b - a);

            const priority =
                CLASS_STAT_PRIORITY?.[charClass] ??
                CLASS_STAT_PRIORITY?.["Default"];

            if (!Array.isArray(priority)) {
                console.error("Invalid CLASS_STAT_PRIORITY for:", charClass);
                return statArray;
            }

            const map = {};
            priority.forEach((ability, index) => {
                map[ability] = sorted[index];
            });

            return ABILITIES.map(a => map[a] ?? 0);
        }

        let hp = 2;
        let currentGuidedStats = [];

        function buildTable(build, name, level, ancestry, charClass, archetypeId, stats, perk) {

            const archetypeData =
                Object.values(DB_ARCHETYPES).find(a => a.id == archetypeId) || {
                    gear: [],
                    currency: "0g 0s 0c"
                };

            const ancestryName = DB_ANCESTRIES[ancestry];

            let statRows = "";
            for (let i = 0; i < ABILITIES.length; i++) {
                statRows += `
        <tr>
            <td  class="fst-italic">${ABILITIES[i]}</td>
            <td>
                <select class="form-select stat-dropdown" data-index="${i}">
                    ${stats.map(value => `<option value="${value}" ${value === stats[i] ? "selected" : ""}>
                      ${value}
                          </option>
                            `).join("")}
                </select>
            </td>
        </tr>
    `;
            }

            hp = stats[0] * level;
            const slots = 10 + stats[0];

            const pack = archetypeData?.gear || [];

            const currency = archetypeData.currency;

            const archetypeName =
                Object.keys(DB_ARCHETYPES).find(
                    key => DB_ARCHETYPES[key]?.id == archetypeId
                ) || "Unknown Archetype";

            return `
        <h3 class="b">${build}</h3>
        <table class="table table-bordered">
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td class="i">Character Name</td><td>${name}</td></tr>
            <tr><td class="i">Ancestry</td><td>${ancestryName}</td></tr>
            <tr><td class="i">Class</td><td>${charClass}</td></tr>
            <tr><td class="i">Level</td><td>${level}</td></tr>
            <tr><td class="i">Archetype</td><td>${archetypeName}</td></tr>
            <tr><td class="i">Perk</td><td>${perk}</td></tr>
            <tr><td class="i">HP Formula</td><td>${hp}</td></tr>
            <tr><td class="i">Item Slots</td><td>${slots}</td></tr>
            <tr><td class="i">Starting Currency</td><td>${currency}</td></tr>
        </table>

        <h4 class="b">Stats</h4>
        <table class="table table-bordered">
            <tr><th>Ability</th><th>Score</th></tr>
            ${statRows}
        </table>

        <h4 class="b">Pack</h4>
        <ul>${pack.map(item => `<li>${item}</li>`).join("")}</ul>
    `;
        }
        function updateDerived(stats) {

            const level = parseInt(slider.value, 10);

            const hp = stats[0] * level;
            const slots = 10 + stats[0];

            let output = document.getElementById("derived-output");
            if (!output) {
                output = document.createElement("div");
                output.id = "derived-output";
                document.getElementById("stat-editor").appendChild(output);
            }

            output.innerHTML = `
        <strong>Live Stats</strong><br>
        HP: ${hp}<br>
        Item Slots: ${slots}
    `;
        }

        function generateGuided() {
            const level = parseInt(slider.value, 10);
            const ancestry = document.getElementById("guided-ancestry").value;
            const archetype = parseInt(document.getElementById("guided-archetype").value);
            const classId = document.getElementById("guided-class").value;
            // convert ID → class name
            const charClass = DB_CLASS[classId];

            const statsInput = document.querySelector('input[name="guided-stats"]:checked');
            if (!statsInput) return alert("Please select a stat array");
            const stats = statsInput.value.split(",").map(n => parseInt(n.trim()));
            const assignedStats = assignStatsByClass(stats, charClass);

            // initialize shared state
            currentGuidedStats = [...assignedStats];

            const hp = assignedStats[0] * level;

            const perk = document.getElementById("guided-perk").value || "—";

            let name;
            const useGeneratedName = document.getElementById("nameGen").checked;

            const ancestryKey = DB_ANCESTRIES[ancestry]?.toLowerCase();

            const archetypeName = DB_ARCHETYPES[
                Object.keys(DB_ARCHETYPES).find(k => DB_ARCHETYPES[k].id == archetype)
            ]?.name;

            if (useGeneratedName) {
                name = generateCharacterName({
                    ancestry: ancestryKey,
                    className: charClass,
                    archetype: archetypeName
                });
            } else {
                name = document.getElementById("nameInput").value;
            }

            generatedGuidedCharacter = {
                name,
                level,
                hp,
                ancestry,
                class: classId,
                archetype,
                stats: assignedStats.join(","),
                perk
            };

            const outputDiv = document.getElementById("guided-output");

            // 1. Render table
            outputDiv.innerHTML =
                buildTable("Generated Hero", name, level, ancestry, charClass, archetype, assignedStats, perk);




        }
        document.getElementById("guided-output").addEventListener("change", function (e) {
            if (!e.target.classList.contains("stat-dropdown")) return;

            const index = parseInt(e.target.dataset.index);
            const newValue = parseInt(e.target.value);
            const oldValue = currentGuidedStats[index];

            // swap logic
            const swapIndex = currentGuidedStats.findIndex((v, i) => v === newValue && i !== index);

            if (swapIndex !== -1) {
                currentGuidedStats[swapIndex] = oldValue;
            }

            currentGuidedStats[index] = newValue;

            // update character
            generatedGuidedCharacter.stats = currentGuidedStats.join(",");

            // re-render ENTIRE table (important)
            document.getElementById("guided-output").innerHTML =
                buildTable(
                    "Generated Hero",
                    generatedGuidedCharacter.name,
                    generatedGuidedCharacter.level,
                    generatedGuidedCharacter.ancestry,
                    DB_CLASS[generatedGuidedCharacter.class],
                    generatedGuidedCharacter.archetype,
                    currentGuidedStats,
                    generatedGuidedCharacter.perk
                );
        });

        function generateRandom() {
            const level = parseInt(document.getElementById("random-level").value, 10);

            const ancestryIds = Object.keys(DB_ANCESTRIES);
            const ancestryId = ancestryIds[Math.floor(Math.random() * ancestryIds.length)];

            const classIds = Object.keys(DB_CLASS);
            const classId = classIds[Math.floor(Math.random() * classIds.length)];
            const charClass = DB_CLASS[classId];

            let archetypeList = CLASS_SUGGESTIONS?.[charClass];

            // ✅ Fallback if class has no suggestions
            if (!Array.isArray(archetypeList) || archetypeList.length === 0) {
                archetypeList = Object.keys(DB_ARCHETYPES);
            }

            const archetypeName =
                archetypeList[Math.floor(Math.random() * archetypeList.length)];

            const archetypeId =
                DB_ARCHETYPES[archetypeName] ? DB_ARCHETYPES[archetypeName].id : null;

            const statArrays = [
                [6, 6, 5, 3, 2, 2],
                [5, 5, 5, 4, 3, 2],
                [7, 6, 4, 3, 2, 1],
                [6, 5, 5, 4, 2, 2],
                [6, 6, 4, 4, 3, 2],
                [5, 5, 4, 4, 3, 3]
            ];

            const stats = statArrays[Math.floor(Math.random() * statArrays.length)];
            const assignedStats = assignStatsByClass(stats, charClass);

            let name;

            const ancestryKey = DB_ANCESTRIES[ancestryId]?.toLowerCase();

            name = generateCharacterName({
                ancestry: ancestryKey,
                className: charClass,
                archetype: archetypeName
            });
            const hp = assignedStats[0] * level;

            generatedRandomCharacter = {
                name,
                level,
                hp,
                ancestry: ancestryId,
                class: classId,
                archetype: archetypeId,
                stats: assignedStats.join(","),
                perk: "Random Perk"
            };

            document.getElementById("random-output").innerHTML =
                buildTable("Random Hero", name, level, ancestryId, charClass, archetypeId, assignedStats, "Random Perk");
        }

        function submitCharacter(character) {
            if (!character) {
                errorBanner.innerText = 'Please generate a character before submitting.';
                errorBanner.hidden = false;
                return;
            }

            const formData = new FormData();
            formData.append('level', character.level);
            formData.append('name', character.name);
            formData.append('hp', character.hp);
            formData.append('ancestry', character.ancestry);
            formData.append('class', parseInt(character.class));
            formData.append('archetype', character.archetype);
            formData.append('stats', character.stats);
            formData.append('perk', character.perk);
            console.log("SUBMIT CLASS VALUE:", character.class);
            console.log("TYPE:", typeof character.class);

            const fileField = document.getElementById('file');
            if (fileField && fileField.files[0]) {
                formData.append('filename', fileField.files[0]);
            }

            fetch("http://localhost:80/", { method: 'POST', body: formData })
                .then(response => {
                    if (response.status === 400) {
                        return response.json().then(json => ({
                            status: response.status,
                            json
                        }));
                    } else {
                        return response.text().then(text => ({
                            status: response.status,
                            text
                        }));
                    }
                })
                .then(({ status, json }) => {

                    clearFieldErrors();
                    errorBanner.hidden = true;
                    errorBanner.classList.remove('alert-danger', 'alert-success');
                    errorBanner.hidden = false;

                    if (status === 400 && json?.errors) {

                        errorBanner.classList.add('alert-danger');
                        errorBanner.innerText = 'Form has errors. Please correct them and resubmit.';

                        json.errors.forEach(error => {
                            const key = error.param || error.path;
                            const targetId = GUIDED_FIELD_ID_MAP[key];
                            if (!targetId) return;
                            showFieldError(targetId, error.msg);
                        });

                    } else {

                        errorBanner.classList.add('alert-success');
                        errorBanner.innerText = 'Character submitted successfully!';
                        errorBanner.hidden = false;

                    }
                });
        }

        document.getElementById('submit-guided')
            .addEventListener('click', () => submitCharacter(generatedGuidedCharacter));

        document.getElementById('submit-random')
            .addEventListener('click', () => submitCharacter(generatedRandomCharacter));

        function clearFieldErrors() {
            const errorElements = document.querySelectorAll('.text-danger');
            errorElements.forEach(el => {
                el.innerHTML = '&nbsp;';
                el.classList.add('d-none');
            });
        }

        function showFieldError(targetId, msg) {
            const el = document.getElementById(targetId);
            if (el) {
                el.innerHTML = msg;
                el.classList.remove('d-none');
            }
        }

</script>
