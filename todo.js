let tasks = JSON.parse(localStorage.getItem('tasks')) || { pending: [], completed: [] };
let selectedFilter = localStorage.getItem('selected-filter') || 'all';

// html elements
const inputForm = document.getElementById('input-form-section');
const todoInput = document.getElementById('todo-input');
const taskSection = document.getElementById('tasks-section');
const taskRemainingElement = document.getElementById('task-remaining-count');
const completeAllTaskBtn = document.getElementById('complete-all-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const taskFiltersSection = document.getElementById('task-filters');

// Initial setups
loadTasks();
updateFilter()

// Event listeners
inputForm.addEventListener('submit', onAddTask);
taskSection.addEventListener('click', onClickTaskSection);
completeAllTaskBtn.addEventListener('click', onCompleteAllTask);
clearCompletedBtn.addEventListener('click', onClearCompletedTasks);
taskFiltersSection.addEventListener('change', onChangeFilter);

// Event handle for adding new task
function onAddTask(e) {
    console.log(e);
    e.preventDefault();
    const taskName = todoInput.value;
    e.target.reset();
    const task = {
        taskName,
        completed: false,
        id: Date.now().toString(),
    }
    tasks.pending.push(task);
    if (selectedFilter === 'all' || selectedFilter === 'uncompleted') {
        addTask(task, tasks.pending.length);
    }
    updateFooterActions();
    updateTaskCount();
    updateTasksInLocalStorage();
}

// Event handler for task section
function onClickTaskSection(e) {
    if (e.target.dataset.actionType === 'delete-task') {
        onDeleteTask(e);
    } else if (e.target.dataset.actionType === 'toggle-task') {
        console.log(e);
        onToggleTaskComplete(e);
    }
}

// Complete all task
function onCompleteAllTask() {
    if (tasks.pending.length == 0) return;

    tasks.pending.forEach(t => t.completed = true);
    tasks.completed.splice(0, 0, ...tasks.pending);
    tasks.pending = [];
    loadTasks();
    updateTasksInLocalStorage();
}

// Clear all completed tasks
function onClearCompletedTasks() {
    tasks.completed = [];
    loadTasks();
    updateTasksInLocalStorage();
}


// Delete the task
function onDeleteTask(e) {
    const taskInputElement = document.getElementById(e.target.dataset.id);
    const isTaskComplete = taskInputElement.checked;
    const taskList = isTaskComplete ? tasks.completed : tasks.pending;
    const taskIndex = taskList.findIndex(t => t.id === e.target.dataset.id);
    console.log(taskIndex);
    if (taskIndex >= 0) {
        deleteTask(taskList[taskIndex]);
        taskList.splice(taskIndex, 1);
        updateTaskCount();
        updateTasksInLocalStorage();
    }
}

// Event handler for toggle task complete status
function onToggleTaskComplete(e) {
    const isTaskComplete = e.target.checked;
    const taskId = e.target.dataset.id;
    console.log(e.target);
    isTaskComplete ? moveTaskToCompleted(taskId) : moveTaskToPending(taskId);

    updateTasksInLocalStorage();
    loadTasks();
}

// Move the task to completed state
function moveTaskToCompleted(taskId) {
    const index = tasks.pending.findIndex(t => t.id === taskId);

    if (index < 0) { return; }

    const task = tasks.pending.splice(index, 1)[0];
    task.completed = true;

    // If there is no pending task then there is no need to add the completed task at last.
    if (tasks.pending.length == 0) {
        tasks.completed.unshift(task);
    } else {
        tasks.completed.push(task);
    }
}

// Move the task to pending state
function moveTaskToPending(taskId) {
    const index = tasks.completed.findIndex(t => t.id === taskId);

    if (index < 0) { return; }

    const task = tasks.completed.splice(index, 1)[0];
    task.completed = false;

    tasks.pending.push(task);
}

// Change filters
function onChangeFilter(e) {
    selectedFilter = e.target.value;
    localStorage.setItem('selected-filter', selectedFilter);
    loadTasks();
}

// Select the filter on first time
function updateFilter() {
    const selectedFilterElement = document.getElementById(selectedFilter);
    selectedFilterElement.checked = true;
}

// Fetch tasks from local storage
function loadTasksFromLocalStorage() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
}

// Add task to local storage
function updateTasksInLocalStorage() {
    const taskString = JSON.stringify(tasks);
    localStorage.setItem('tasks', taskString);
}

// Load task from localStorage to DOM
function loadTasks() {
    console.log(tasks);
    taskSection.innerHTML = '';
    if (selectedFilter === 'all' || selectedFilter === 'uncompleted') {
        tasks.pending.forEach((task) => addTask(task));
    }
    if (selectedFilter === 'all' || selectedFilter === 'completed') {
        tasks.completed.forEach((task) => addTask(task));
    }
    updateFooterActions()
    updateTaskCount();
}

// Update Task remaining count
function updateTaskCount() {
    let taskCount = 0;
    if (selectedFilter == 'all' || selectedFilter == 'uncompleted') {
        taskCount += tasks.pending.length;
    }

    if (selectedFilter == 'all' || selectedFilter == 'completed') {
        taskCount += tasks.completed.length;
    }
    taskRemainingElement.innerHTML = taskCount.toString();
}

// Updated Footer actions
function updateFooterActions() {
    const canEnableCompletedAll = tasks.pending.length > 0 && selectedFilter !== 'completed';
    completeAllTaskBtn.disabled = !canEnableCompletedAll;

    const canEnableClearCompleted = tasks.completed.length > 0;
    clearCompletedBtn.disabled = !canEnableClearCompleted;
}

// Add task to DOM
function addTask(task, index) {
    const checked = task.completed ? 'checked' : '';
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.dataset.id = task.id;

    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" name="taskCompleted" id="${task.id}" data-id="${task.id}" data-action-type="toggle-task" ${checked}>
        <label for="${task.id}" class="task-name">${task.taskName}</label>
        <button id="delete-task" class="btn">
            <i class="fa-solid fa-circle-xmark" data-id="${task.id}" data-action-type="delete-task"></i>
        </button>
    `;

    console.log(taskSection.childNodes.length, index);
    if (taskSection.childNodes.length === 0 || index == undefined || index === 0) {
        taskSection.appendChild(taskElement);
    } else {
        taskSection.insertBefore(taskElement, taskSection.childNodes[index - 1]);
    }
};

// Delete task
function deleteTask(task) {
    const taskElement = document.querySelector(`.task[data-id="${task.id}"]`);
    console.log(task);
    taskElement.remove();
};
