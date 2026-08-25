import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, accessSync, constants } from 'fs';
import { join } from 'path';

const _dirname = import.meta.dirname;
const tasksFile = join(_dirname, 'data', 'tasks.json');
const TaskStatus = Object.freeze({
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    DONE: 'done'
});

function loadTasks() {
    try {
        const raw = readFileSync(tasksFile, 'utf8');
        
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw new Error(`Cannot read file ${tasksFile}: ${error.message}`);
    }
}

function saveTasks(tasks) {
    try {
        if (existsSync(tasksFile)) {
            copyFileSync(tasksFile, `${tasksFile}.bak`);
        }

        writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
    } catch (error) {
        throw new Error(`Cannot read file ${tasksFile}: ${error.message}`);
    }
}

function addNewTask(args) {
    if (args.length == 0) {
        console.log('You may add a description to the task. Usage: add <task message>');
        return;
    }

    const tasks = loadTasks();
    let taskAlreadyExists = -1;

    for (const t of tasks) {
        if (t.description === args[0]) {
            taskAlreadyExists = t.id;
            break;
        }
    }

    if (taskAlreadyExists != -1) {
        console.log(`The task you want to add already exists with ID ${taskAlreadyExists}`);
        return;
    }

    let newTask = { 
        id: getNewId(), 
        description: args[0], 
        status: TaskStatus.TODO, 
        createdAt: Date.now(),
        updatedAt: null
    };

    tasks.push(newTask);
    saveTasks(tasks);

    console.log(`New task added with ID: ${newTask.id}.`);
}

function updateTaskDescription(args) {
    if (args.length < 2) {
        console.log('You may provide a task id. Usage: update <task id> <new description>');
        return;
    }

    let [taskId, newDescription] = args;
    taskId = Number(taskId);

    let taskFound = false;
    let updated = false;
    let lastDescription = null;
    const allTasks = loadTasks();

    for (const task of allTasks) {
        if (task.id === taskId) {
            if (task.description !== newDescription) {
                lastDescription = task.description;

                task.description = newDescription;
                task.updatedAt = Date.now();

                updated = true;
            }

            taskFound = true;
            break;
        }
    }

    if (!taskFound) {
        console.log(`The task with ID ${taskId} doesn't exists`);
        return;
    }

    if (!updated) {
        console.log(`The task with ID ${taskId} has already this description, nothing has changed.`);
        return;
    }

    saveTasks(allTasks);

    console.log(`You update the task ID ${taskId}. Before: "${lastDescription}" | After: "${newDescription}"`);
}

function deleteTask(taskId) {
    if (args.length == 0) {
        console.log('You may provide a task id. Usage: delete <task id>');
        return;
    }

    let rawTaskId = args[0];
    let deleteTaskId = parseInt(rawTaskId);
    if (isNaN(deleteTaskId)) {
        console.log('You must provide a task id (a number). Usage: delete <task id>');
        return;
    }

    if (args.length < 2 || args[1] !== '--confirm') {
        console.log(`To confirm the deletion of this task, type next to task id "--confirm". Usage: delete <task id> --confirm`);
        return;
    }

    let tasks = loadTasks();
    let tasksLength = tasks.length;

    tasks = tasks.filter(t => t.id !== deleteTaskId);
    let newtasksLength = tasks.length;
    saveTasks(tasks);

    let wasDeleted = tasksLength != newtasksLength;

    if (!wasDeleted) {
        console.log(`The task with ID ${rawTaskId} doesn't exists.`);
        return;
    }

    console.log(`The task with ID ${rawTaskId} was deleted.`);
}

function markTaskAsInProgress(args) {
    if (args.length == 0) {
        console.log('You may provide a task id to mark as in progress. Usage: mark-in-progress <task id>');
        return;
    }

    let taskId = Number(args[0]);
    if (isNaN(taskId)) {
        console.log('You may provide a valid task id (number). Usage: mark-in-progress <task id>');
        return;
    }

    let taskFound = false;
    let updated = false;
    const allTasks = loadTasks();

    for (const task of allTasks) {
        if (task.id === taskId) {
            if (task.status !== TaskStatus.IN_PROGRESS) {
                task.status = TaskStatus.IN_PROGRESS;
                task.updatedAt = Date.now();

                updated = true;
            }
            
            taskFound = true;
            break;
        }
    }

    if (!taskFound) {
        console.log(`The task with ID ${taskId} doesn't exists.`);
        return;
    }

    if (!updated) {
        console.log(`The task with ID ${taskId} is already marked as in progress, nothing has changed.`);
        return;
    }

    saveTasks(allTasks);

    console.log(`The task with ID ${taskId} has been marked as in progress.`);
}

function markTaskAsDone(args) {
    if (args.length == 0) {
        console.log('You may provide a task id to mark as done. Usage: done <task id>');
        return;
    }

    let taskId = Number(args[0]);
    if (isNaN(taskId)) {
        console.log('You may provide a valid task id (number). Usage: done <task id>');
        return;
    }

    let taskFound = false;
    let updated = false;
    const allTasks = loadTasks();

    for (const task of allTasks) {
        if (task.id === taskId) {
            if (task.status !== TaskStatus.DONE) {
                task.status = TaskStatus.DONE;
                task.updatedAt = Date.now();

                updated = true;
            }
            
            taskFound = true;
            break;
        }
    }

    if (!taskFound) {
        console.log(`The task with ID ${taskId} doesn't exists.`);
        return;
    }

    if (!updated) {
        console.log(`The task with ID ${taskId} is already marked as done, nothing has changed.`);
        return;
    }

    saveTasks(allTasks);

    console.log(`The task with ID ${taskId} has been marked as done.`);
}

function printAllTask() {
    const allTasks = loadTasks();

    if(allTasks.length == 0) {
        console.log('You haven\'t added any tasks yet!');
        return;
    }

    allTasks.sort((a, b) => {
        if (a.status === TaskStatus.TODO && b.status !== TaskStatus.TODO) return -1;
        if (b.status === TaskStatus.TODO && a.status !== TaskStatus.TODO) return 1;

        if (a.status === TaskStatus.IN_PROGRESS && b.status !== TaskStatus.IN_PROGRESS) return -1;
        if (b.status === TaskStatus.IN_PROGRESS && a.status !== TaskStatus.IN_PROGRESS) return 1;

        return 0;
    });

    console.log('================= ALL TASK =================');
    for (const task of allTasks) {
        const { id, description, status, createdAt, updatedAt } = task;
        const timeLabeled = formatDateTime(createdAt);
        
        console.log(`Id: ${id} | Task: "${description}" | Status: ${status} | Created: ${timeLabeled} ${(updatedAt ? `| Modified: ${formatDateTime(updatedAt)}` : '')}`);
    }
}

function printTasksByStatus(status) {
    /**
     * @type {any[]}
     */
    const allTasks = loadTasks().filter(t => t.status === status);

    if(allTasks.length == 0) {
        console.log('There are not TODO tasks');
        return;
    }

    console.log(`================= ${status.replace('-', ' ').toUpperCase()} =================`);
    for (const task of allTasks) {
        const { id, description, status, createdAt, updatedAt } = task;
        const timeLabeled = formatDateTime(createdAt)

        console.log(`Id: ${id} | Task: "${description}" | Status: ${status} | Created: ${timeLabeled} ${(updatedAt ? `| Modified: ${formatDateTime(updatedAt)}` : '')}`);
    }
}

function getNewId() {
    try {
        const allTasks = loadTasks();

        return allTasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
    } catch (error) {
        throw new Error(`Couldn't get a new id. Error: ${error.message}`);
    }
}

function formatDateTime(timestamp) {
    const time = new Date(timestamp);
    const diffMin = Math.floor((Date.now() - timestamp) / 60000);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMin < 60) return `Hace ${Math.max(diffMin, 0)}m`;
    if (diffHours < 24) return `Hace ${diffHours}m`;

    if (diffHours < (24 * 7)) {
        return new Intl.DateTimeFormat("es", {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
        }).format(time);
    }

    return new Intl.DateTimeFormat("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(time);
}

const [,, action, ...args] = process.argv;

try {
    switch (action) {
        case 'add':
            addNewTask(args);
            break;
        case 'update':
            updateTaskDescription(args);
            break;
        case 'delete':
            deleteTask(args);
            break;
        case 'mark-in-progress':
            markTaskAsInProgress(args);
            break;
        case 'done':
            markTaskAsDone(args);
            break;
        case 'list':
            if (args.length == 0) {
                printAllTask();
                break;
            }
            
            switch (args[0]) {
                case 'todo':
                    printTasksByStatus(TaskStatus.TODO);
                    break;
                case 'in-progress':
                    printTasksByStatus(TaskStatus.IN_PROGRESS);
                    break;
                case 'done':
                    printTasksByStatus(TaskStatus.DONE);
                    break;
                default:
                    console.log('Available list options: "todo", "in-progress" and "done".');
                    break;
            }
            break;
        default:
            break;
    }
} catch (error) {
    console.log(`An error was throwed: ${error.message}`);
    process.exit(1);
}