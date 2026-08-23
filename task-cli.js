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
        updateAt: null
    };

    tasks.push(newTask);
    saveTasks(tasks);

    console.log(`New task added with ID: ${newTask.id}.`);
}

function deleteTask(taskId) {
    if (args.length == 0) {
        console.log('You may add a task id. Usage: delete <task id>');
        return;
    }

    let rawTaskId = args[0];
    let deleteTaskId = parseInt(rawTaskId);
    if (isNaN(deleteTaskId)) {
        console.log('You must provide a task id (a number). Usage: delete <task id>');
        return;
    }

    if (args.length < 2 || args[1] !== '--confirm') {
        console.log('To confirm the deletion of this task, type next to task id "--confirm". Usage: delete <task id> --confirm');
        return;
    }

    let tasks = loadTasks();
    let tasksLength = tasks.length;

    tasks = tasks.map(t => t.id !== taskId);
    let newtasksLength = tasks.length;
    saveTasks(tasks);

    let wasDeleted = tasksLength != newtasksLength;

    if (!wasDeleted) {
        console.log(`The task with ID ${rawTaskId} doesn't exists.`);
        return;
    }

    console.log(`The task with ID ${rawTaskId} was deleted.`);
}

function getNewId() {
    try {
        let newId = 1;
        let allTasks = loadTasks();

        for (const task of allTasks) {
            if (task.id !== newId) break;
            newId++;
        }

        return newId;
    } catch (error) {
        throw new Error(`Couldn't get a new id. Error: ${error.message}`);
    }
}

const [,, action, ...args] = process.argv;

try {
    let tasks = [];

    switch (action) {
        case 'add':
            addNewTask(args);
            break;
        case 'delete':
            deleteTask(args);
            break;
        default:
            break;
    }
} catch (error) {
    console.log(`An error was throwed: ${error.message}`);
    process.exit(1);
}