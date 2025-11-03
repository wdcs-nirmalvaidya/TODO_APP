const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const stats = document.getElementById("stats");
const Bar = document.getElementById("progress");
const Canvas = document.getElementById("taskChart");

const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  alert("Please login first!");
  location.href = "index.html";
}

const users = JSON.parse(localStorage.getItem("users")) || {};
let editedLi = null;

const chart = new Chart(Canvas, {
  type: "pie",
  data: {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ["#4caf50", "#ff5c33"]
      }
    ]
  },
  options: {
    plugins: { legend: { position: "bottom" } }
  }
});

addBtn.onclick = () => {
  const text = input.value.trim();
  if (!text) return alert("Please enter a task!");

  if (text.length > 30) {
    alert("Task cannot exceed 30 characters (including spaces)!");
    return;
  }

  if (editedLi) {
    if (editedLi.classList.contains("done")) {
      alert("You can’t edit a completed task!");
      editedLi = null;
      input.value = "";
      addBtn.textContent = "Add";
      return;
    }

    editedLi.querySelector("span").textContent = text + " ";
    editedLi = null;
    addBtn.textContent = "Add";
  } else {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${text}</span>
      <div class="actions">
        <button class="edit" title="Edit Task">✏️</button>
        <button class="del" title="Delete Task">❌</button>
      </div>`;
    list.appendChild(li);
  }

  input.value = "";
  saveTasks();
  updateStats();
};

list.onclick = e => {
  const li = e.target.closest("li");
  if (!li) return;

  if (e.target.classList.contains("edit")) {
    if (li.classList.contains("done")) {
      alert("You can’t edit a completed task!");
      return;
    }
    input.value = li.querySelector("span").textContent.trim();
    editedLi = li;
    addBtn.textContent = "Edit";
  }

  else if (e.target.classList.contains("del")) {
    li.remove();
    saveTasks();
    updateStats();
  }

  else if (e.target.tagName === "LI" || e.target.tagName === "SPAN") {
    li.classList.toggle("done");

    const editBtn = li.querySelector(".edit");
    if (li.classList.contains("done")) {
      if (editBtn) editBtn.style.display = "none"; 
    } else {
      if (editBtn) editBtn.style.display = "inline-block"; 
    }

    saveTasks();
    updateStats();
  }
};

function saveTasks() {
  users[currentUser] = users[currentUser] || {};
  users[currentUser].tasks = [...list.children].map(li => ({
    text: li.querySelector("span").textContent.trim(),
    done: li.classList.contains("done")
  }));
  localStorage.setItem("users", JSON.stringify(users));
}

function loadTasks() {
  const saved = users[currentUser]?.tasks || [];
  list.innerHTML = "";
  saved.forEach(({ text, done }) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${text}</span>
      <div class="actions">
        <button class="edit" title="Edit Task">✏️</button>
        <button class="del" title="Delete Task">❌</button>
      </div>`;
    if (done) {
      li.classList.add("done");
      li.querySelector(".edit").style.display = "none"; 
    }
    list.appendChild(li);
  });
  updateStats();
}

function updateStats() {
  const total = list.children.length;
  const done = [...list.children].filter(li => li.classList.contains("done")).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  stats.textContent = `Total: ${total} | Completed: ${done} | Progress: ${percent}%`;
  Bar.style.width = percent + "%";

  chart.data.datasets[0].data = [done, total - done];
  chart.update();
}

window.onload = loadTasks;
