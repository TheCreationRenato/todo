const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const requesterInput = document.getElementById('requesterInput');
const executorInput = document.getElementById('executorInput');
const startDateInput = document.getElementById('startDateInput');
const dueDateInput = document.getElementById('dueDateInput');
const statusInput = document.getElementById('statusInput');
const stepInput = document.getElementById('stepInput');
const addStepButton = document.getElementById('addStepButton');
const initialStepsList = document.getElementById('initialStepsList');
const cancelEditButton = document.getElementById('cancelEditButton');
const taskCount = document.getElementById('taskCount');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const progressChart = document.getElementById('progressChart');
const progressPercent = document.getElementById('progressPercent');
const tasksContent = document.getElementById('tasksContent');
const themeSelect = document.getElementById('themeSelect');
const viewButtons = document.querySelectorAll('.view-button');
const tabButtons = document.querySelectorAll('.tab-button');

let tasks = [
  {
    id: 1,
    title: 'Protótipo da demanda',
    description: 'Criar o esqueleto inicial da tela e validar o fluxo de cadastro.',
    requester: 'Ana',
    executor: 'Bruno',
    startDate: '2026-08-01',
    dueDate: '2026-08-10',
    status: 'em-execucao',
    completed: false,
    steps: [
      { id: 101, text: 'Definir estrutura inicial', done: true },
      { id: 102, text: 'Validar fluxo', done: false }
    ]
  },
  {
    id: 2,
    title: 'Revisar conteúdo',
    description: 'Confirmar as informações antes do envio para aprovação.',
    requester: 'Carla',
    executor: 'Diego',
    startDate: '2026-08-05',
    dueDate: '2026-08-08',
    status: 'concluida',
    completed: true,
    steps: [{ id: 201, text: 'Confirmar texto', done: true }]
  },
  {
    id: 3,
    title: 'Planejar próxima etapa',
    description: 'Mapear a priorização das próximas demandas.',
    requester: 'Edu',
    executor: 'Fabia',
    startDate: '2026-08-09',
    dueDate: '2026-08-12',
    status: 'a-fazer',
    completed: false,
    steps: []
  }
];

let editingTaskId = null;
let activeTab = 'em-execucao';
let pendingInitialSteps = [];

function getTaskStatus(task) {
  return task.status || (task.completed ? 'concluida' : 'a-fazer');
}

function syncTaskCompletion(task) {
  const status = getTaskStatus(task);
  return {
    ...task,
    completed: status === 'concluida',
    status
  };
}

function renderInitialSteps() {
  initialStepsList.innerHTML = '';

  if (pendingInitialSteps.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-column';
    empty.textContent = 'Nenhum step adicionado ainda.';
    initialStepsList.appendChild(empty);
    return;
  }

  pendingInitialSteps.forEach((step) => {
    const item = document.createElement('li');
    item.className = 'step-item';

    const text = document.createElement('span');
    text.className = 'step-text';
    text.textContent = step.text;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'step-remove-button';
    removeButton.textContent = '✕';
    removeButton.addEventListener('click', () => removeInitialStep(step.id));

    item.append(text, removeButton);
    initialStepsList.appendChild(item);
  });
}

function addInitialStep(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  pendingInitialSteps = [...pendingInitialSteps, { id: Date.now(), text: trimmedText }];
  renderInitialSteps();
}

function removeInitialStep(id) {
  pendingInitialSteps = pendingInitialSteps.filter((step) => step.id !== id);
  renderInitialSteps();
}

function renderSummary() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  taskCount.textContent = totalTasks === 1 ? '1 tarefa' : `${totalTasks} tarefas`;
  pendingCount.textContent = pendingTasks;
  completedCount.textContent = completedTasks;
  progressPercent.textContent = `${percent}%`;
  progressChart.style.background = `conic-gradient(var(--accent) 0 ${percent}%, var(--border) ${percent}% 100%)`;
}

function renderTasksView() {
  tasksContent.innerHTML = '';

  const filteredTasks = tasks.filter((task) => getTaskStatus(task) === activeTab);

  if (filteredTasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-column';
    empty.textContent = activeTab === 'em-execucao'
      ? 'Nenhuma tarefa em execução no momento.'
      : activeTab === 'a-fazer'
        ? 'Nenhuma tarefa para fazer.'
        : 'Nenhuma tarefa concluída ainda.';
    tasksContent.appendChild(empty);
    return;
  }

  filteredTasks.forEach((task) => appendTaskCard(task));
}

function appendTaskCard(task) {
  const item = document.createElement('article');
  item.className = `task-item${task.completed ? ' completed' : ''}`;

  const content = document.createElement('div');
  content.className = 'task-content';

  const header = document.createElement('div');
  header.className = 'task-header';

  const title = document.createElement('h3');
  title.className = 'task-title';
  title.textContent = task.title;

  const badge = document.createElement('span');
  badge.className = 'task-badge';
  badge.textContent = getTaskStatus(task) === 'concluida' ? 'Concluída' : getTaskStatus(task) === 'em-execucao' ? 'Em execução' : 'A fazer';

  const description = document.createElement('p');
  description.className = 'task-description';
  description.textContent = task.description;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.innerHTML = `
    <span><strong>Solicitante:</strong> ${task.requester}</span>
    <span><strong>Executor:</strong> ${task.executor}</span>
    <span><strong>Início:</strong> ${task.startDate || 'Não informada'}</span>
    <span><strong>Prevista:</strong> ${task.dueDate || 'Não informada'}</span>
  `;

  const stepsList = document.createElement('ul');
  stepsList.className = 'steps-list';
  (task.steps || []).forEach((step) => {
    const listItem = document.createElement('li');
    listItem.className = `step-item${step.done ? ' done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = step.done;
    checkbox.addEventListener('change', () => toggleStep(task.id, step.id));

    const text = document.createElement('span');
    text.className = 'step-text';
    text.textContent = step.text;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'step-remove-button';
    removeButton.textContent = '✕';
    removeButton.addEventListener('click', () => removeStep(task.id, step.id));

    listItem.append(checkbox, text, removeButton);
    stepsList.appendChild(listItem);
  });

  const stepForm = document.createElement('form');
  stepForm.className = 'step-form';
  stepForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = stepForm.querySelector('input');
    if (input.value.trim()) {
      addStep(task.id, input.value);
      input.value = '';
    }
  });

  const stepInput = document.createElement('input');
  stepInput.className = 'step-input';
  stepInput.type = 'text';
  stepInput.maxLength = 80;
  stepInput.placeholder = 'Adicionar step';

  const addStepButton = document.createElement('button');
  addStepButton.type = 'submit';
  addStepButton.className = 'step-add-button';
  addStepButton.textContent = 'Adicionar';

  stepForm.append(stepInput, addStepButton);

  const actionsRow = document.createElement('div');
  actionsRow.className = 'task-actions-row';

  const statusSelect = document.createElement('select');
  statusSelect.className = 'task-status-select';
  statusSelect.innerHTML = `
    <option value="a-fazer" ${getTaskStatus(task) === 'a-fazer' ? 'selected' : ''}>A fazer</option>
    <option value="em-execucao" ${getTaskStatus(task) === 'em-execucao' ? 'selected' : ''}>Em execução</option>
    <option value="concluida" ${getTaskStatus(task) === 'concluida' ? 'selected' : ''}>Concluída</option>
  `;
  statusSelect.addEventListener('change', (event) => updateTaskStatus(task.id, event.target.value));

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'icon-button toggle-button';
  toggleButton.setAttribute('aria-label', task.completed ? 'Marcar como pendente' : 'Marcar como concluída');
  toggleButton.textContent = task.completed ? '✓' : '○';
  toggleButton.addEventListener('click', () => toggleTask(task.id));

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'icon-button edit-button';
  editButton.textContent = '✎';
  editButton.setAttribute('aria-label', 'Editar tarefa');
  editButton.addEventListener('click', () => editTask(task.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'icon-button delete-button';
  deleteButton.setAttribute('aria-label', 'Excluir tarefa');
  deleteButton.textContent = '✕';
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  header.append(title, badge);
  content.append(header, description, meta, stepsList, stepForm);
  actions.append(toggleButton, editButton, deleteButton);
  actionsRow.append(statusSelect);
  item.append(content, actions);
  item.appendChild(actionsRow);
  tasksContent.appendChild(item);
}

function addTask(taskData) {
  const title = taskData.title.trim();

  if (!title) {
    return;
  }

  const normalizedTask = {
    id: Date.now(),
    title,
    description: taskData.description.trim(),
    requester: taskData.requester.trim(),
    executor: taskData.executor.trim(),
    startDate: taskData.startDate,
    dueDate: taskData.dueDate,
    status: taskData.status,
    completed: taskData.status === 'concluida',
    steps: taskData.steps || []
  };

  tasks.unshift(normalizedTask);
  renderAll();
}

function updateTask(taskId, taskData) {
  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    const updatedTask = {
      ...task,
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      requester: taskData.requester.trim(),
      executor: taskData.executor.trim(),
      startDate: taskData.startDate,
      dueDate: taskData.dueDate,
      status: taskData.status,
      completed: taskData.status === 'concluida',
      steps: task.steps || []
    };

    return updatedTask;
  });

  renderAll();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    const nextStatus = task.completed ? 'a-fazer' : 'concluida';
    return syncTaskCompletion({ ...task, status: nextStatus });
  });

  renderAll();
}

function updateTaskStatus(id, status) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    return syncTaskCompletion({ ...task, status });
  });

  renderAll();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  renderAll();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  editingTaskId = id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  requesterInput.value = task.requester;
  executorInput.value = task.executor;
  startDateInput.value = task.startDate || '';
  dueDateInput.value = task.dueDate || '';
  statusInput.value = getTaskStatus(task);
  cancelEditButton.hidden = false;
  document.querySelector('.view-button[data-view="summary"]').click();
  titleInput.focus();
}

function addStep(taskId, text) {
  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      steps: [...(task.steps || []), { id: Date.now(), text, done: false }]
    };
  });

  renderAll();
}

function toggleStep(taskId, stepId) {
  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      steps: (task.steps || []).map((step) => (step.id === stepId ? { ...step, done: !step.done } : step))
    };
  });

  renderAll();
}

function removeStep(taskId, stepId) {
  tasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return {
      ...task,
      steps: (task.steps || []).filter((step) => step.id !== stepId)
    };
  });

  renderAll();
}

function resetTaskForm() {
  taskForm.reset();
  editingTaskId = null;
  pendingInitialSteps = [];
  cancelEditButton.hidden = true;
  statusInput.value = 'a-fazer';
  renderInitialSteps();
  titleInput.focus();
}

function renderAll() {
  renderSummary();
  renderTasksView();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('todo-theme', theme);
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('todo-theme') || 'light';
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    document.getElementById('summaryView').classList.toggle('is-hidden', view !== 'summary');
    document.getElementById('tasksView').classList.toggle('is-hidden', view !== 'tasks');
    viewButtons.forEach((item) => item.classList.toggle('active', item === button));
  });
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeTab = button.dataset.status;
    tabButtons.forEach((item) => item.classList.toggle('active', item === button));
    renderTasksView();
  });
});

addStepButton.addEventListener('click', () => {
  addInitialStep(stepInput.value);
  stepInput.value = '';
  stepInput.focus();
});

stepInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addInitialStep(stepInput.value);
    stepInput.value = '';
    stepInput.focus();
  }
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const taskData = {
    title: titleInput.value,
    description: descriptionInput.value,
    requester: requesterInput.value,
    executor: executorInput.value,
    startDate: startDateInput.value,
    dueDate: dueDateInput.value,
    status: statusInput.value,
    steps: pendingInitialSteps
  };

  if (editingTaskId) {
    updateTask(editingTaskId, taskData);
  } else {
    addTask(taskData);
  }

  resetTaskForm();
});

cancelEditButton.addEventListener('click', () => {
  resetTaskForm();
});

themeSelect.addEventListener('change', (event) => {
  applyTheme(event.target.value);
});

initializeTheme();
renderInitialSteps();
renderAll();
