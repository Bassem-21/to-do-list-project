let tasks = [];
let showTasks = document.getElementById('show-tasks');
let taskAdded = document.getElementById('task-added');
let id = 0;

function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (storedTasks) {
        tasks = storedTasks;
        tasks.forEach(task => {
            id = Math.max(id, task.id); 
            createSingleTaskHtml(task);
        });
    }
}

function addTask() {
    const taskValue = taskAdded.value.trim();
    if (!taskValue) return; 
    addTaskToArray(taskValue);
    createSingleTaskHtml({ id, task: taskValue, completed: false });
    clearTask();
    saveTasks(); 
}

function addTaskToArray(taskValue) {
    id++;
    let tasksToPush = {
        id: id,
        task: taskValue,
        completed: false, 
    };
    tasks.push(tasksToPush);
}

function createSingleTaskHtml(task) {
    const checkedAttribute = task.completed ? 'checked' : '';
    const checkedClass = task.completed ? 'checked' : '';
    const taskHtml = `
        <div class="single-task-container" id="task-${task.id}">
            <div class="single-task-container-left">
                <input type="checkbox" id="checkbox-${task.id}" ${checkedAttribute} onclick="toggleTask(${task.id})">
                <label class="checkbox-label ${checkedClass}" for="checkbox-${task.id}"></label>
                <label for="checkbox-${task.id}" class="${task.completed ? 'completed' : ''}">${task.task}</label>
            </div>
            <button onclick="removeTask(${task.id})">X</button>
        </div>
    `;
    showTasks.innerHTML += taskHtml;

    if (task.completed) {
        const taskElement = document.getElementById(`task-${task.id}`);
        const label = taskElement.querySelector('label:not(.checkbox-label)');
        label.classList.add('completed');
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    task.completed = !task.completed; 
    saveTasks();

    const taskElement = document.getElementById(`task-${taskId}`);
    const label = taskElement.querySelector('label:not(.checkbox-label)');
    const checkboxLabel = taskElement.querySelector('.checkbox-label');
    const checkbox = taskElement.querySelector('input[type="checkbox"]');

    if (task.completed) {
        label.classList.add('completed');
        checkboxLabel.classList.add('checked');
        checkbox.checked = true;
    } else {
        label.classList.remove('completed');
        checkboxLabel.classList.remove('checked');
        checkbox.checked = false; 
}}

function clearTask() {
    taskAdded.value = "";
}

function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    let taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
        taskElement.remove();
    }
    saveTasks(); 
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function clearAllTasks() {
    tasks = [];
    showTasks.innerHTML = ""; 
    saveTasks(); 
}
loadTasks();