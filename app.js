document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  checkDeadlines();
});

document.getElementById('taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const matkul = document.getElementById('taskMatkul').value;
  const name = document.getElementById('taskName').value;
  const deadline = document.getElementById('taskDeadline').value;

  const tasks = getTasks();
  tasks.push({ id: Date.now(), matkul, name, deadline });
  localStorage.setItem('my_tasks', JSON.stringify(tasks));

  document.getElementById('taskForm').reset();
  loadTasks();
  checkDeadlines();
});

function getTasks() {
  return JSON.parse(localStorage.getItem('my_tasks')) || [];
}

function deleteTask(id) {
  const tasks = getTasks().filter(task => task.id !== id);
  localStorage.setItem('my_tasks', JSON.stringify(tasks));
  loadTasks();
}

function getDaysRemaining(deadlineStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr + 'T00:00:00');
  
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function loadTasks() {
  const tasks = getTasks();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="text-xs text-slate-400 text-center py-4">Belum ada tugas tersimpan.</li>';
    return;
  }

  // Urutkan berdasarkan deadline terdekat
  tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  tasks.forEach(task => {
    const daysLeft = getDaysRemaining(task.deadline);
    let badgeClass = 'bg-slate-100 text-slate-700';
    let statusText = `Sisa ${daysLeft} hari`;

    if (daysLeft < 0) {
      badgeClass = 'bg-gray-200 text-gray-500';
      statusText = 'Lewat deadline';
    } else if (daysLeft === 0) {
      badgeClass = 'bg-red-100 text-red-700 font-bold';
      statusText = 'HARI INI!';
    } else if (daysLeft <= 3) {
      badgeClass = 'bg-orange-100 text-orange-700 font-bold';
      statusText = `H-${daysLeft}`;
    }

    const li = document.createElement('li');
    li.className = 'flex justify-between items-center p-3 border rounded-xl text-sm';
    li.innerHTML = `
      <div>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 mb-1 inline-block">${task.matkul}</span>
        <p class="font-semibold text-slate-800">${task.name}</p>
        <p class="text-xs text-slate-500">${task.deadline}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs px-2.5 py-1 rounded-full ${badgeClass}">${statusText}</span>
        <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Fitur Notifikasi Browser
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('Notifikasi berhasil diaktifkan!');
        checkDeadlines();
      }
    });
  } else {
    alert('Browser tidak mendukung notifikasi.');
  }
}

function checkDeadlines() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const tasks = getTasks();
  tasks.forEach(task => {
    const daysLeft = getDaysRemaining(task.deadline);
    if ([1, 2, 3].includes(daysLeft)) {
      new Notification(`📌 Pengingat Tugas: H-${daysLeft}`, {
        body: `[${task.matkul}] ${task.name} akan jatuh tempo dalam ${daysLeft} hari (${task.deadline}).`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
      });
    }
  });
}