const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');
const stats = document.getElementById('stats'); 
const Bar = document.getElementById('progress'); 
const Canvas = document.getElementById('taskChart');

let editedLi = null;


const currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  
  alert("Please login first!");
  window.location.href = 'index.html';
}

let taskChart = new Chart(Canvas, {
  type: 'pie',
  data: {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#4caf50', '#ff5c33']
    }]
  },
  options: { plugins: { legend: { position: 'bottom' } } }
});

addBtn.addEventListener('click', addOrEditTask);
window.addEventListener('load', loadTasks); 

function addOrEditTask() {
  const taskText = input.value.trim();
  if (taskText === "") return alert("Please enter a task!");

  if (editedLi) {
    editedLi.querySelector('span').textContent = taskText + " ";
    editedLi = null;
    addBtn.textContent = "Add";
  } else {
    const li = createTaskElement({ text: taskText, done: false });
    list.appendChild(li);
  }

  input.value = "";
  saveTasks();
  updateStats();
}

function createTaskElement(task) {
  const li = document.createElement('li');
  if (task.done) li.classList.add('done');

  const textSpan = document.createElement('span');
  textSpan.textContent = task.text + " ";
  li.appendChild(textSpan);

  const editBtn = document.createElement('button');
  editBtn.textContent = "✏️";
  editBtn.onclick = () => {
    input.value = task.text;
    editedLi = li;
    addBtn.textContent = "Edit";
  };
  li.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.textContent = "❌";
  delBtn.onclick = () => {
    li.remove();
    saveTasks();
    updateStats();
  };
  li.appendChild(delBtn);

  li.addEventListener('click', (e) => {
    if (e.target === editBtn || e.target === delBtn) return;
    li.classList.toggle('done');
    saveTasks();
    updateStats();
  });

  return li;
}

function saveTasks() {
  const tasks = Array.from(list.children).map(li => ({
    text: li.querySelector('span').textContent.trim(),
    done: li.classList.contains('done')
  }));


  const users = JSON.parse(localStorage.getItem('users')) || {};
  if (currentUser && users[currentUser]) {
    users[currentUser].tasks = tasks;
    localStorage.setItem('users', JSON.stringify(users));
  }
}

function loadTasks() {
  const users = JSON.parse(localStorage.getItem('users')) || {};
  const saved = (currentUser && users[currentUser]) ? users[currentUser].tasks : [];

  list.innerHTML = "";
  saved.forEach(task => list.appendChild(createTaskElement(task)));
  updateStats();
}

function updateStats() {
  const total = list.children.length;
  const completed = document.querySelectorAll('.done').length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  stats.textContent = `Total: ${total} | Completed: ${completed} | Progress: ${percent}%`;
  Bar.style.width = percent + '%';

  const remaining = total - completed;
  taskChart.data.datasets[0].data = [completed, remaining];
  taskChart.update();
  
}
