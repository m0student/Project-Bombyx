// ============================================================
// Завдання 2 — Лічильник напоїв з історією
// ============================================================
// Вимоги:
//   1. +/- через delegation, дані з dataset, МІНІМУМ 0.
//   2. localStorage — persist стану.
//   3. #total = сума; #leader = напій з max; контейнер лідера .is-leader.
//   4. #history — останні 5 дій ("+1 кави", "-1 води", "reset").
//   5. #undo — інверсія останньої дії, до 10 кроків назад.
//   6. #reset — confirm() перед скиданням; reset теж скасовується через undo.
//   7. #export — створює і скачує JSON-файл зі станом.
//   8. Throttle: повторні кліки по тій самій кнопці — не частіше ніж 200мс.
//   9. Event delegation замість окремих listener'ів.
// ============================================================

const STORAGE_KEY = "task-2-counters";
const HISTORY_LIMIT = 5;
const UNDO_LIMIT = 10;
const THROTTLE_MS = 200;

// Single Source of Truth

let state = {
    counters: {
        "кави": 0,
        "чаю": 0,
        "води": 0
    },
    history: [],
    undoStack: []
};

const lastClicks = {
    "кави": 0,
    "чаю": 0,
    "води": 0
}

// state verification & loading

const saved = localStorage.getItem(STORAGE_KEY);

if (saved) state = JSON.parse(saved);

// render

function render() {
    const elemDrinks = document.querySelectorAll(".counter");

    elemDrinks.forEach(tipple => {
        const name = tipple.dataset.name;
        const actualCount = state.counters[name];

        tipple.querySelector(".value").textContent = actualCount;
        tipple.querySelector(".minus").disabled = (actualCount === 0);
    });

    const total = Object.values(state.counters).reduce((sum, val) => sum + val, 0);
    document.querySelector("#total").textContent = total;

    const leaderSpan = document.querySelector("#leader");

    if (total === 0) {
        leaderSpan.textContent = "-";
        elemDrinks.forEach(el => el.classList.remove("is-leader"));
    } else {
        const maxVal = Math.max(...Object.values(state.counters));
        const leaders = [];

        elemDrinks.forEach(tipple => {
            const name = tipple.dataset.name;

            if (state.counters[name] === maxVal) {
                tipple.classList.add("is-leader");
                leaders.push(tipple.querySelector(".label").textContent);
            } else {
                tipple.classList.remove("is-leader");
            }
        });

        leaderSpan.textContent = leaders.join(", ");
    }

    // history

    const history = document.querySelector("#history");
    history.innerHTML = "";

    for (let i = 0; i < Math.min(state.history.length, HISTORY_LIMIT); ++i) {

        const li = document.createElement("li");

        li.textContent = state.history[i];
        history.appendChild(li);
    }
}

// event listeners & logic 

document.querySelector("#counters").addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const name = button.closest(".counter").dataset.name;

    // throttle

    if (Date.now() - lastClicks[name] < THROTTLE_MS) return;
    lastClicks[name] = Date.now();

    if (state.undoStack.length >= UNDO_LIMIT) state.undoStack.shift();
    state.undoStack.push(JSON.stringify(state.counters));

    // tipple values

    if (button.classList.contains("plus")) {
        state.counters[name] += 1;
        state.history.unshift(`+1 ${name}`);
    } else if (button.classList.contains("minus")) {
        if (state.counters[name] > 0) {
            state.counters[name] -= 1;
            state.history.unshift(`-1 ${name}`);
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    render();
});

document.querySelector(".panel").addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    // undo

    if (button.id === "undo" && state.undoStack.length > 0) {
        state.counters = JSON.parse(state.undoStack.pop());
        state.history.shift();
    }

    // reset
    
    if (button.id === "reset" && confirm("Скинути всі лічильники?")) {
        if (state.undoStack.length >= UNDO_LIMIT) state.undoStack.shift();
        state.undoStack.push(JSON.stringify(state.counters));

        state.counters = { "кави": 0, "чаю": 0, "води": 0 };
        state.history.unshift("очищення");
    }

    // export
    
    if (button.id === "export") {
        const json = JSON.stringify({ counters: state.counters, history: state.history });
        const blob = new Blob([json], { type: "application/json" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "state.json";
        a.click();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    render();
});

render();