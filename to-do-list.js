const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');
const taskCounter = document.getElementById('task-counter');
const clearCompleted = document.getElementById('clear-completed');
const clearAll = document.getElementById('clear-all');

function addTaskRow(text, completed = false) {
    const li = document.createElement('li');
    li.classList.toggle('checked', completed);
    const label = document.createElement('div');
    label.className = 'task-text';
    label.textContent = text;
    li.appendChild(label);
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'edit-task';
    edit.textContent = '✎';
    edit.title = 'Edit task';
    edit.setAttribute('aria-label', 'Edit task');
    li.appendChild(edit);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-task';
    remove.title = 'Delete task';
    remove.textContent = '\u00d7';
    remove.setAttribute('role', 'button');
    remove.setAttribute('tabindex', '0');
    remove.setAttribute('aria-label', 'Delete task');
    li.appendChild(remove);
    listContainer.appendChild(li);
}

function AddTask() {
    const text = inputBox.value.trim();
    if (!text) {
        inputBox.focus();
        return;
    }
    addTaskRow(text);
    inputBox.value = '';
    saveData();
    inputBox.focus();
}

inputBox.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.isComposing) AddTask();
});

function editTask(li) {
    const label = li.querySelector('.task-text');
    if (li.querySelector('.task-edit-input')) return;
    const original = label.textContent;
    const field = label.cloneNode(true);
    field.classList.add('task-edit-input');
    field.contentEditable = 'plaintext-only';
    field.setAttribute('role', 'textbox');
    field.setAttribute('aria-multiline', 'true');
    field.setAttribute('aria-label', 'Task text');
    label.replaceWith(field);
    const editButton = li.querySelector('.edit-task');
    editButton.textContent = '✓';
    editButton.title = 'Save task';
    editButton.setAttribute('aria-label', 'Save task');
    let finished = false;
    function finish(cancel = false) {
        if (finished) return;
        finished = true;
        label.textContent = cancel ? original : (field.innerText.trim() || original);
        field.replaceWith(label);
        editButton.textContent = '✎';
        editButton.title = 'Edit task';
        editButton.setAttribute('aria-label', 'Edit task');
        saveData();
    }
    field.addEventListener('save-task', () => finish());
    field.addEventListener('blur', event => {
        if (event.relatedTarget !== editButton) finish();
    });
    field.addEventListener('keydown', event => {
        if (event.isComposing) return;
        if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) {
            event.preventDefault();
            finish(event.key === 'Escape');
            li.querySelector('.edit-task').focus();
        }
    });
    field.focus();
}

listContainer.addEventListener('click', function (event) {
    const target = event.target;
    const li = target.closest('li');
    if (!li || target.closest('.task-edit-input')) return;
    if (target.closest('.edit-task')) {
        const field = li.querySelector('.task-edit-input');
        if (field) field.dispatchEvent(new Event('save-task'));
        else editTask(li);
    } else if (target.closest('.delete-task')) {
        li.remove();
        saveData();
    } else {
        li.classList.toggle('checked');
        saveData();
    }
});

clearCompleted.addEventListener('click', function () {
    listContainer.querySelectorAll('li.checked').forEach(task => task.remove());
    saveData();
});

clearAll.addEventListener('click', function () {
    listContainer.replaceChildren();
    saveData();
});

function updateCounter() {
    const total = listContainer.children.length;
    const completed = listContainer.querySelectorAll('li.checked').length;
    const remaining = total - completed;
    taskCounter.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
    clearCompleted.disabled = completed === 0;
    clearAll.disabled = total === 0;
}

function saveData() {
    const saved = listContainer.cloneNode(true);
    saved.querySelectorAll('.task-edit-input').forEach((field, index) => {
        const label = document.createElement('div');
        label.className = 'task-text';
        label.textContent = listContainer.querySelectorAll('.task-edit-input')[index].innerText;
        field.replaceWith(label);
    });
    localStorage.setItem('data', saved.innerHTML);
    updateCounter();
}

function showTask() {
    const savedData = localStorage.getItem('data');
    if (savedData) {
        // Rebuild existing saved tasks, including lists saved before editing was added.
        const saved = document.createElement('template');
        saved.innerHTML = savedData;
        saved.content.querySelectorAll('li').forEach(task => {
            const text = task.querySelector('.task-text')?.textContent ?? Array.from(task.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent).join('');
            addTaskRow(text, task.classList.contains('checked'));
        });
    }
    updateCounter();
}

showTask();
