# Task Tracker CLI

A simple command-line task manager built with Node.js. Track your tasks through three states: **todo**, **in-progress** and **done**. No dependencies required.

This is a personal project: https://roadmap.sh/projects/task-tracker.

## Requirements

- [Node.js](https://nodejs.org) **v20.11 or higher**.

## Installation

```bash
git clone https://github.com/<your-user>/task-tracker-cli.git
cd task-tracker-cli
```

## Usage

```bash
node task-cli.js <command> [arguments]
```

### Commands

| Command | Description |
|---|---|
| `add "<description>"` | Add a new task (duplicates are rejected) |
| `update <id> "<new description>"` | Change a task's description |
| `delete <id> --confirm` | Delete a task (requires `--confirm`) |
| `mark-in-progress <id>` | Mark a task as *in progress* |
| `done <id>` | Mark a task as *done* |
| `list` | List all tasks |
| `list todo` | Only pending tasks |
| `list in-progress` | Only tasks in progress |
| `list done` | Only completed tasks |

### Examples

```bash
node task-cli.js add "Buy groceries"
# New task added with ID: 1.

node task-cli.js list
# ================= ALL TASK =================
# Id: 1 | Task: "Buy groceries" | Status: todo | Created: Hace 5m

node task-cli.js mark-in-progress 1
node task-cli.js done 1
node task-cli.js delete 1 --confirm
```

## How data is stored

Tasks are saved in `data/tasks.json`, created automatically on first use. Before every write, the previous file is copied to `tasks.json.bak` as a safety backup. It doesn't have a function to automatically recover this file.