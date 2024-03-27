import { appState } from "../app";
import { Task } from "../models/Task";
import { getFromStorage } from "../utils";
import { User } from "../models/User";

// ввод первой задачи
export const addFirstTask = function (document) {
    const inputTask = document.querySelector(".input");
    const submitBtn = document.querySelector(".btn-submit");
    const addBtn = document.querySelector(".btn-add");



    addBtn.addEventListener("click", function (e) {
        inputTask.style.display = 'block';
        addBtn.style.display = 'none';
        submitBtn.style.display = 'block';

    })

    submitBtn.addEventListener("click", function (e) {
        const bodyBacklog = document.querySelector(".kanban-backlog");

        if (inputTask.value != '') {
            const task = new Task(inputTask.value, "backlog");
            Task.save(task);
            const newTask = document.createElement('div');
            newTask.classList.add('kanban-element');
            newTask.setAttribute("draggable", "true");
            newTask.id = task.id;
            newTask.innerHTML = task.description;

            newTask.addEventListener("dragstart", () => {
                newTask.classList.add("is-dragging");
            });

            newTask.addEventListener("dragend", () => {
                newTask.classList.remove("is-dragging");
            });
            bodyBacklog.append(newTask);

            inputTask.value = "";
            inputTask.style.display = 'none';
            addBtn.style.display = 'block';
            submitBtn.style.display = 'none';

            Show();

        }

    })
}

//добавление задач в выпадающий список
export const dropDownList = function (bodyClass, addBtnClass, taskForClass) {
    const bodyes = document.querySelectorAll(".kanban-body");
    const taskForReady = document.querySelector(taskForClass);
    const addBtn = document.querySelector(addBtnClass);
    addBtn.setAttribute("disabled", true);

    for (let body of bodyes) {
        if (body == document.querySelector(bodyClass)) {
            // console.log(body)

            let children = body.children;
            for (let node of children) {
                console.log(node)

                if (node.id != "") {
                    // console.log(node.id)
                    addBtn.removeAttribute("disabled");
                    // Создаем уникальный id для элемента задачи
                    const taskId = `task_${node.id}`;
                    // console.log(taskId)

                    // Проверяем, существует ли уже элемент с таким id в taskForReady
                    const existingTask = document.getElementById(taskId);
                    if (!existingTask) {
                        // Если элемента с таким id еще нет в списке, то добавляем его
                        const taskFrom = document.createElement('div');
                        taskFrom.classList.add('kanban-element');
                        taskFrom.id = taskId;
                        taskFrom.innerHTML = node.textContent;
                        taskFrom.setAttribute("draggable", "true");
                        taskForReady.append(taskFrom);
                        console.log(taskFrom)
                        Show();

                    }
                }
            }
        }
    }
}


//открыть/закрыть выпадающий список 
export const downList = function (addBtn, listClass) {
    const add = document.querySelector(addBtn);
    const task = document.querySelector(listClass);

    let tasks = getFromStorage('tasks');
    if (tasks.length != 0) {
        // console.log(tasks)

        add.style.display = "block";
        let isTask = true;
        add.addEventListener('click', function (e) {
            if (isTask) {
                task.style.display = "block";
                // console.log('открыть');
                isTask = false;
            } else {
                task.style.display = "none";
                // console.log('закрыть');
                isTask = true;
            }
        })
    }
}

//выбор задачи из выпадающего списка
export const dropListBody = function (fromClass, bodyClass, newState) {
    const dropDownListTask = document.querySelectorAll('.kanban-from');
    const body = document.querySelector(bodyClass);
    for (let listTask of dropDownListTask) {
        if (listTask == document.querySelector(fromClass)) {
            listTask.addEventListener('click', function (e) {
                e.preventDefault();
                const task = e.target.closest('.kanban-element');
                if (task && !task.classList.contains('processed')) {
                    task.classList.add('processed');
                    // Создаем копию задачи
                    const clonedTask = task.cloneNode(true);
                    clonedTask.id = task.id.slice(5);
                    console.log(clonedTask)
                    // Удаляем задачу из state и обновляем локальное хранилище
                    const taskId = task.id.replace("task_", "");
                    console.log(taskId)

                    const tasks = getFromStorage('tasks');
                    const updatedTasks = tasks.map(t => {
                        if (t.id === taskId) {
                            // t.state = "ready";
                            t.state = newState; // Изменяем состояние задачи в зависимости от нового состояния
                            console.log(t.state)
                            Task.save(t);
                        }
                        return t;
                    });
                    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

                    body.append(clonedTask);
                    // Удаление из выпадающего списка
                    task.remove();
                    // Удаление из Backlog
                    const removeTask = document.getElementById(taskId);
                    if (removeTask) {
                        removeTask.remove();
                    }
                    Show();
                }

            })
        }
    }

}

export const countTasks = function () {
    const backlogColumn = document.querySelector('.kanban-backlog');
    const finishedColumn = document.querySelector('.kanban-finished');

    const backlogTaskCount = backlogColumn.children.length;
    const finishedTaskCount = finishedColumn.children.length;


    document.querySelector(".backlog-lenght").innerHTML = backlogTaskCount;
    document.querySelector(".finished-lenght").innerHTML = finishedTaskCount;
    document.querySelector(".name-footer").innerHTML = appState._currentUser.login;
    const date = new Date();

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    document.querySelector(".year-footer").innerHTML = [year, month, day].join('-');

    // console.log(`Количество задач в колонке Backlog: ${backlogTaskCount}`);
    // console.log(`Количество задач в колонке Finished: ${finishedTaskCount}`);
};

export const showAdmin = function () {
    // Получаем все задачи из хранилища
    const allTasks = getFromStorage('tasks');

    // Отображаем все задачи всех пользователей в колонкaх
    for (const task of allTasks) {
        // Создаем элемент для задачи
        const user = document.createElement('p');
        user.textContent = `Пользователь ${task.login}`;
        const taskElement = document.createElement('div');
        taskElement.classList.add('kanban-element');

        taskElement.textContent = `${task.description}`;
        taskElement.setAttribute("draggable", "true");
        taskElement.state = task.state;
        console.log(taskElement.state)
        taskElement.id = `task_${task.id}`;

        // Добавляем обработчики событий для перетаскивания
        taskElement.addEventListener("dragstart", () => {
            taskElement.classList.add("is-dragging");
        });

        taskElement.addEventListener("dragend", () => {
            taskElement.classList.remove("is-dragging");
        });

        // Определяем, в какую колонку добавить задачу на основе её состояния
        let targetColumnClass;
        switch (task.state) {
            case 'backlog':
                targetColumnClass = '.kanban-backlog';
                break;
            case 'ready':
                targetColumnClass = '.kanban-ready';
                break;
            case 'progress':
                targetColumnClass = '.kanban-progress';
                break;
            case 'finished':
                targetColumnClass = '.kanban-finished';
                break;
            default:
                // По умолчанию добавляем в колонку "Backlog"
                targetColumnClass = '.kanban-backlog';
        }
        // Добавляем задачу в соответствующую колонку 
        const targetColumn = document.querySelector(targetColumnClass);
        targetColumn.appendChild(user);
        targetColumn.appendChild(taskElement);
    }

    // Включаем функциональность Drag and Drop для всех задач в колонке 
    addDragAndDrop();
};

export const addUser = function () {
    const addUserForm = document.querySelector('.user-management-form');
    addUserForm.style.display = "block";

    const userForm = document.querySelector('#userForm');
    userForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Получаем значения имени пользователя и пароля из формы
        const login = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;

        // Создаем объект пользователя
        const newUser = new User(login, password);

        // Получаем текущих пользователей из локального хранилища
        const users = getFromStorage("users") || [];

        // Проверяем, нет ли уже пользователя с таким именем
        const existingUser = users.find(u => u.login === newUser.login);
        if (existingUser) {
            alert('Пользователь с таким именем уже существует!');
            return;
        }

        // Добавляем нового пользователя в массив пользователей
        users.push(newUser);

        // Сохраняем обновленный массив пользователей в локальное хранилище
        User.save(newUser);

        // Очищаем поля формы
        document.querySelector('#username').value = '';
        document.querySelector('#password').value = '';

        // Обновляем список пользователей на странице
        updateUsersList(users);
    });

    const updateUsersList = function (users) {
        const userList = document.querySelector('#userList');
        // Очищаем текущий список пользователей
        userList.innerHTML = '';

        // Добавляем каждого пользователя в список
        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `Login: ${user.login} Password: ${user.password}`;

            // Создаем кнопку "Remove User" для удаления пользователя
            const removeButton = document.createElement('button');
            removeButton.textContent = '- Remove User';
            removeButton.addEventListener('click', function () {
                removeUser(user.login, user.password);
            });
            listItem.appendChild(removeButton);

            userList.appendChild(listItem);
        });

    };

        // Функция для удаления пользователя
        const removeUser = function( login, password) {
            // Получаем текущих пользователей из локального хранилища
            let users = getFromStorage('users') || [];
            users.innerHTML = '';

            // Фильтруем пользователей, оставляя только тех, чей логин не совпадает с удаляемым
            users = users.filter(user => user.login !== login );
    
            // Обновляем список пользователей в локальном хранилище
            localStorage.setItem("users", JSON.stringify(users));
    
            // Обновляем список пользователей на странице
            updateUsersList(users);
        };

    // При загрузке страницы, обновляем список пользователей
    document.addEventListener('DOMContentLoaded', function () {
        const users = getFromStorage('users') || [];
        updateUsersList(users);
    });

    updateUsersList(getFromStorage('users') || []);

};



export const showReady = function () {
    dropDownList('.kanban-backlog', '.btn-ready', '.backlog');
    downList('.btn-ready', '.backlog');
    dropListBody('.backlog', '.kanban-ready', 'ready');

};

export const showProgress = function () {
    dropDownList('.kanban-ready', '.btn-progress', '.ready');
    downList('.btn-progress', '.ready');
    dropListBody('.ready', '.kanban-progress', 'progress');

};

export const showFinished = function () {
    dropDownList('.kanban-progress', '.btn-finished', '.inprogress');
    downList('.btn-finished', '.inprogress');
    dropListBody('.inprogress', '.kanban-finished', 'finished');
};


export const addDragAndDrop = function () {
    const kanbanBodies = document.querySelectorAll('.kanban-body');

    kanbanBodies.forEach(body => {
        body.addEventListener('dragstart', handleDragStart);
        body.addEventListener('dragover', handleDragOver);
        body.addEventListener('drop', handleDrop);
    });
};

const handleDragStart = function (e) {
    e.dataTransfer.setData('text/plain', e.target.id);
};

const handleDragOver = function (e) {
    e.preventDefault();
};

const handleDrop = function (e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const droppedTask = document.getElementById(taskId);
    const targetColumn = e.currentTarget;
    if (targetColumn) {
        targetColumn.appendChild(droppedTask);
    }


    // После переноса задачи необходимо обновить ее состояние
    const newState = targetColumn.classList.contains('kanban-backlog') ? 'backlog' :
        targetColumn.classList.contains('kanban-ready') ? 'ready' :
            targetColumn.classList.contains('kanban-progress') ? 'progress' :
                targetColumn.classList.contains('kanban-finished') ? 'finished' : '';

    if (newState !== '') {
        const taskIdWithoutPrefix = taskId.replace('task_', '');
        const tasks = getFromStorage('tasks');
        const updatedTasks = tasks.map(t => {
            if (t.id === taskIdWithoutPrefix) {
                t.state = newState;
                Task.save(t);
            }
            return t;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));

        // После обновления состояния, обновим счетчики задач
        countTasks();
    }
};



export const Show = function () {

    showReady();
    showProgress();
    showFinished();

    countTasks();
    addDragAndDrop();
}

