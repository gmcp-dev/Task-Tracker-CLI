import { existsSync, mkdirSync, accessSync, constants } from 'fs';
import { join } from 'path';

const _dirname = import.meta.dirname;
const folderPath = join(_dirname, 'data');

try {
    accessSync(_dirname, constants.R_OK | constants.W_OK);
} catch (error) {
    console.log('The program doesn\'t have access to read/write into this path.');
    return;
}

if (!existsSync(folderPath)) {
    mkdirSync(folderPath);
}

const [,, action, ...args] = process.argv;