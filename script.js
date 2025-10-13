const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');
const stats = document.getElementById('stats'); 
const Bar = document.getElementById('progress'); 
const Canvas = document.getElementById('taskChart');

let editedLi = null;


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
    addBtn.textContent = "Add";
    editedLi = null;
  } else {
    const li = document.createElement('li');
    const textSpan = document.createElement('span');
    textSpan.textContent = taskText + " ";
    li.appendChild(textSpan);

    const editBtn = document.createElement('button');
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      input.value = textSpan.textContent.trim();
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

    list.appendChild(li);
  }

  input.value = "";
  saveTasks();
  updateStats();
}


function saveTasks() {
  localStorage.setItem('tasks', list.innerHTML);
}


function loadTasks() {
  list.innerHTML = localStorage.getItem('tasks') || "";
  list.querySelectorAll('li').forEach(li => {
    const editBtn = li.querySelector('button:nth-child(2)');
    const delBtn = li.querySelector('button:nth-child(3)');

    li.addEventListener('click', (e) => {
      if (e.target === editBtn || e.target === delBtn) return;
      li.classList.toggle('done');
      saveTasks();
      updateStats();
    });

    delBtn.onclick = () => {
      li.remove();
      saveTasks();
      updateStats();
    };

    editBtn.onclick = () => {
      input.value = li.querySelector('span').textContent.trim();
      editedLi = li;
      addBtn.textContent = "Edit";
    };
  });
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
