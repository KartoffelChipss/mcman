import path from 'path';
import fs from 'fs';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted } from '../util/formatter';
import inquirer from 'inquirer';

export interface StartCommandOptions {
    flags?: string;
    gui?: boolean;
    memory?: string;
}

export const startCommand = async (
    name: string | undefined,
    options: StartCommandOptions
) => {
    const flags = (
        options.flags !== undefined
            ? options.flags
            : (appConfig.get('javaArgs') as string)
    ).split(' ');
    const gui = options.gui !== undefined ? options.gui : appConfig.get('gui');
    const memory =
        options.memory !== undefined ? options.memory : appConfig.get('memory');

    if (name) {
        const serverJar = await getJarFromName(name);
        startServer(serverJar, flags, gui, memory);
        return;
    }

    const serverJar = await findServerJar(process.cwd());

    if (!serverJar) {
        logFormatted('&cNo server jar found in the current directory!');
        process.exit(1);
    }

    startServer(serverJar, flags, gui, memory);
};

import { spawn } from 'child_process';

const startServer = async (
    serverJar: string,
    flags: string[],
    gui: boolean,
    memory: string
) => {
    const dir = path.dirname(serverJar);
    const jarName = path.basename(serverJar);
    const command = 'java';
    const args = [
        `-Xms${memory}`,
        `-Xmx${memory}`,
        ...flags,
        '-jar',
        jarName,
        gui ? '' : '--nogui'
    ].filter((arg) => arg !== '');

    logFormatted(`&aStarting server in directory: ${dir}`);
    logFormatted(`&8Command: ${command} ${args.join(' ')}`);

    const serverProcess = spawn(command, args, { cwd: dir, stdio: 'inherit' });

    serverProcess.on('exit', (code) => {
        logFormatted(`&aServer process exited with code ${code}`);
    });

    serverProcess.on('error', (error) => {
        logFormatted(`&cError starting server: ${error.message}`);
    });
};

const getJarFromName = async (name: string) => {
    const servers = appConfig.get('servers');
    const server = servers.find(
        (server: any) => server.name.toLowerCase() === name.toLowerCase()
    );

    if (!server) {
        logFormatted('&cNo server found with that name!');
        process.exit(1);
    }

    return server.serverJar;
};

const findJarFiles = async (dir: string): Promise<string[]> => {
    const files = await fs.promises.readdir(dir);
    return files.filter((file) => file.endsWith('.jar'));
};

const findServerJar = async (dir: string): Promise<string | null> => {
    if (fs.existsSync(path.join(dir, 'server.jar'))) {
        return path.join(dir, 'server.jar');
    }

    let serverJar = null;

    const jarFiles = await findJarFiles(dir);

    if (jarFiles.length === 0) {
        return null;
    }

    if (jarFiles.length === 1) {
        serverJar = path.join(dir, jarFiles[0]);
    } else {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'jarFile',
                message: 'Select the server jar file',
                choices: jarFiles
            }
        ]);

        serverJar = path.join(dir, answers.jarFile);
    }

    return serverJar;
};
