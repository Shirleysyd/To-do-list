const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const searchBtn = document.getElementById('search-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const todoList = document.getElementById('todo-list');
const totalCount = document.getElementById('total-count');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filteredTasks = null; // null means show all

function getCheckboxSVG(checked) {
  if (checked) {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z" fill="#2C2C2C"/><path d="M15.3334 6L8.00002 13.3333L4.66669 10" stroke="#F5F5F5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="path-1-inside-1_1_1105" fill="white"><path d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z"/></mask><path d="M0 4C0 1.79086 1.79086 0 4 0H16C18.2091 0 20 1.79086 20 4V16C20 18.2091 18.2091 20 16 20H4C1.79086 20 0 18.2091 0 16V4Z" fill="white"/><path d="M4 0V1H16V0V-1H4V0ZM20 4H19V16H20H21V4H20ZM16 20V19H4V20V21H16V20ZM0 16H1V4H0H-1V16H0ZM4 20V19C2.34315 19 1 17.6569 1 16H0H-1C-1 18.7614 1.23858 21 4 21V20ZM20 16H19C19 17.6569 17.6569 19 16 19V20V21C18.7614 21 21 18.7614 21 16H20ZM16 0V1C17.6569 1 19 2.34315 19 4H20H21C21 1.23858 18.7614 -1 16 -1V0ZM4 0V-1C1.23858 -1 -1 1.23858 -1 4H0H1C1 2.34315 2.34315 1 4 1V0Z" fill="#757575" mask="url(#path-1-inside-1_1_1105)"/></svg>`;
  }
}

function getDeleteSVG() {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function renderTasks(list) {
  todoList.innerHTML = '';
  (list || tasks).forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.tabIndex = 0;
    // Checkbox
    const checkbox = document.createElement('button');
    checkbox.className = 'todo-checkbox';
    checkbox.innerHTML = getCheckboxSVG(task.done);
    checkbox.setAttribute('aria-checked', task.done ? 'true' : 'false');
    checkbox.setAttribute('tabindex', '0');
    checkbox.addEventListener('click', () => {
      task.done = !task.done;
      saveTasks();
      renderTasks(filteredTasks ?? null);
      updateCount();
    });
    // Label
    const label = document.createElement('span');
    label.className = 'todo-label';
    label.textContent = task.text;
    if (task.done) {
      label.classList.add('done');
    }
    // Delete button (x icon)
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = 'Delete Task';
    delBtn.innerHTML = getDeleteSVG();
    delBtn.addEventListener('click', () => {
      const idxInTasks = tasks.indexOf(task);
      if (idxInTasks !== -1) tasks.splice(idxInTasks, 1);
      if (filteredTasks) {
        filteredTasks = filteredTasks.filter(t => t !== task);
      }
      saveTasks();
      renderTasks(filteredTasks ?? null);
      updateCount();
    });
    delBtn.addEventListener('focus', () => delBtn.style.color = 'var(--accent)');
    delBtn.addEventListener('blur', () => delBtn.style.color = 'var(--muted)');
    // Assemble
    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    todoList.appendChild(li);
  });
}

function updateCount() {
  totalCount.textContent = `${(filteredTasks ? filteredTasks.length : tasks.length)}`;
}

function addTask(text) {
  if (!text.trim()) return;
  // If searching, add to main list and show all
  tasks.unshift({ text: text.trim(), done: false });
  filteredTasks = null;
  input.value = '';
  saveTasks();
  renderTasks();
  updateCount();
}

function fuzzySearch(query) {
  if (!query.trim()) {
    filteredTasks = null;
    renderTasks();
    updateCount();
    return;
  }
  
  const q = query.trim().toLowerCase();
  filteredTasks = tasks.filter(task => 
    task.text.toLowerCase().includes(q)
  );
  renderTasks(filteredTasks);
  updateCount();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

addBtn.addEventListener('click', () => {
  addTask(input.value);
});

// Update the keydown event listener to only add tasks
input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
        addTask(input.value);
    }
});

// Keep only the search button click handler
searchBtn.addEventListener('click', () => {
    fuzzySearch(input.value);
});

deleteAllBtn.addEventListener('click', () => {
  tasks = [];
  filteredTasks = null;
  saveTasks();
  renderTasks();
  updateCount();
});

// Initial render
renderTasks();
updateCount();