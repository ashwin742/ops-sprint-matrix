// ==========================================
// 1. GLOBAL APPLICATION STATE & PERSISTENCE
// ==========================================
let sprintState = {
    tasks: [],
    telemetryLogs: []
};

// Fallback seed tasks if localStorage is completely blank
const defaultTasks = [
    { id: "task-1", title: "Map out database schema models", status: "todo", priority: "high", category: "Backend" },
    { id: "task-2", title: "Configure Tailwind CSS utilities", status: "in-progress", priority: "medium", category: "Frontend" },
    { id: "task-3", title: "Audit rendering loop efficiency", status: "done", priority: "low", category: "QA" }
];

// Load data out of browser memory safely
function loadStateFromStorage() {
    const savedTasks = localStorage.getItem("sprint_matrix_tasks");
    if (savedTasks) {
        sprintState.tasks = JSON.parse(savedTasks);
    } else {
        sprintState.tasks = defaultTasks;
        saveStateToStorage();
    }
}

// Lock current state properties into local memory
function saveStateToStorage() {
    localStorage.setItem("sprint_matrix_tasks", JSON.stringify(sprintState.tasks));
}

// ==========================================
// 2. TELEMETRY ENGINE (Data Tracking Stream)
// ==========================================
function logUserInteraction(actionType, targetId, metadata = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: actionType,
        elementId: targetId,
        extraData: metadata
    };

    sprintState.telemetryLogs.push(logEntry);
    console.log("%c[TELEMETRY LOG]", "color: #10b981; font-weight: bold;", logEntry);
}

// ==========================================
// 3. RENDER ENGINE (UI Structural Paint)
// ==========================================
function renderBoard() {
    const todoColumn = document.getElementById("col-todo");
    const inProgressColumn = document.getElementById("col-in-progress");
    const doneColumn = document.getElementById("col-done");

    // Flush old elements to prevent duplication rendering cycles
    todoColumn.innerHTML = "";
    inProgressColumn.innerHTML = "";
    doneColumn.innerHTML = "";

    sprintState.tasks.forEach(task => {
        const taskCard = createTaskCardElement(task);

        if (task.status === "todo") todoColumn.appendChild(taskCard);
        if (task.status === "in-progress") inProgressColumn.appendChild(taskCard);
        if (task.status === "done") doneColumn.appendChild(taskCard);
    });
}

function createTaskCardElement(task) {
    const card = document.createElement("div");

    // Configured dynamic cubic-bezier structural access parameters
    card.className = "bg-slate-800 border border-slate-700/60 p-4 rounded-xl shadow-md hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-grab active:cursor-grabbing animate-fade-in";
    card.id = task.id;

    const priorityColor = task.priority === "high" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
        task.priority === "medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
        "bg-sky-500/10 text-sky-400 border-sky-500/20";

    card.innerHTML = `
        <div class="flex justify-between items-start gap-2 mb-2">
            <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md border ${priorityColor}">
                ${task.priority}
            </span>
            <span class="text-xs text-slate-400 font-medium">${task.category}</span>
        </div>
        <p class="text-sm font-medium text-slate-200">${task.title}</p>
        <div class="mt-4 flex justify-end gap-1.5">
            <button onclick="moveTask('${task.id}', 'todo')" class="px-2 py-1 text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition duration-150">To Do</button>
            <button onclick="moveTask('${task.id}', 'in-progress')" class="px-2 py-1 text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition duration-150">In Flight</button>
            <button onclick="moveTask('${task.id}', 'done')" class="px-2 py-1 text-[11px] font-semibold bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition duration-150">Done</button>
        </div>
    `;

    return card;
}

// ==========================================
// 4. STATE CONTROL MUTATIONS (Action Processors)
// ==========================================
window.moveTask = function(taskId, newStatus) {
    const task = sprintState.tasks.find(t => t.id === taskId);
    if (task) {
        const oldStatus = task.status;
        task.status = newStatus;

        saveStateToStorage();
        logUserInteraction("MOVE_TASK", taskId, { from: oldStatus, to: newStatus });
        renderBoard();
    }
};

window.handleTaskSubmit = function(event) {
    event.preventDefault();

    const titleInput = document.getElementById("task-title");
    const prioritySelect = document.getElementById("task-priority");

    const newTask = {
        id: `task-${Date.now()}`,
        title: titleInput.value.trim(),
        status: "todo",
        priority: prioritySelect.value,
        category: "Ops Data"
    };

    sprintState.tasks.push(newTask);
    saveStateToStorage();
    logUserInteraction("ADD_TASK", newTask.id, { priority: newTask.priority });

    renderBoard();
    titleInput.value = "";
};

// Application Bootstrap Initializer
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    logUserInteraction("BOARD_INITIALIZED", "system");
    renderBoard();
});