import path from 'path';
import fs from 'fs';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted } from '../util/formatter';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import {
    getServerByName,
    ServerConfig,
    updateServer
} from '../util/config/serverConfigManager';
import { isProcessRunning } from '../util/processHelper';
import { getMinecraftJarInfo, isMinecraftProxy } from '../util/jarInfo';
import { AppCommand } from './AppCommand';
import { Command } from 'commander';

interface StartCommandOptions {
    flags?: string;
    gui?: boolean;
    memory?: string;
    detach?: boolean;
}

const startCommand = async (
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
    const detach = options.detach !== undefined ? options.detach : false;

    if (name) {
        const server: ServerConfig | undefined = getServerByName(name);

        if (server && isProcessRunning(server.pid)) {
            logFormatted('&cServer is already running!');
            process.exit(1);
        }

        const serverJar = await getJarFromName(name);
        const pid = startServer(serverJar, flags, gui, memory, detach, name);

        if (!pid) {
            logFormatted('&cError starting server!');
            process.exit(1);
        }

        updateServer(
            {
                name,
                serverJar,
                pid
            },
            true
        );

        if (detach) process.exit(0);
        return;
    }

    const serverJar = await findServerJar(process.cwd());

    if (!serverJar) {
        logFormatted('&cNo server jar found in the current directory!');
        process.exit(1);
    }

    startServer(serverJar, flags, gui, memory, detach);
    if (detach) process.exit(0);
};

const startServer = (
    serverJar: string,
    flags: string[],
    gui: boolean,
    memory: string,
    detach: boolean,
    serverName?: string
): number | null => {
    const mcServerInfos = getMinecraftJarInfo(serverJar);
    const isProxy = isMinecraftProxy(mcServerInfos?.software || '');

    const dir = path.dirname(serverJar);
    const jarName = path.basename(serverJar);
    const command = 'java';
    const args = [
        `-Xms${memory}`,
        `-Xmx${memory}`,
        ...flags,
        '-jar',
        jarName,
        gui || isProxy ? '' : '--nogui'
    ].filter((arg) => arg !== '');

    logFormatted(`&aStarting server in directory: ${dir}`);
    logFormatted(`&8Command: ${command} ${args.join(' ')}`);

    const serverProcess = spawn(command, args, {
        cwd: dir,
        detached: detach,
        stdio: detach ? 'ignore' : 'inherit'
    });

    const pid = serverProcess.pid;

    if (!pid) {
        logFormatted('&cError starting server!');
        return null;
    }

    logFormatted(`&aServer started with PID: ${pid}`);

    process.on('SIGINT', () => {
        logFormatted('&cReceived SIGINT (Ctrl + C), stopping the server...');
        if (serverName)
            updateServer(
                {
                    name: serverName,
                    serverJar: serverJar,
                    pid: null
                },
                false
            );
        serverProcess.kill('SIGTERM');
        process.exit(0);
    });

    serverProcess.on('error', (error) => {
        logFormatted(`&cError starting server: ${error.message}`);
    });

    serverProcess.on('exit', (code) => {
        logFormatted(`&cServer exited with code: ${code}`);

        if (serverName)
            updateServer(
                {
                    name: serverName,
                    serverJar: serverJar,
                    pid: null
                },
                false
            );
    });

    return pid;
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

export class StartCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('start [name]')
            .description('Start a server')
            .option('--flags <flags>', 'Specify the Java flags to use')
            .option('--gui', 'Open the server GUI')
            .option(
                '-m, --memory <memory>',
                'Specify the amount of memory to allocate'
            )
            .option('-d, --detach', 'Detach the server process')
            .action((name: string | undefined, options: StartCommandOptions) =>
                startCommand(name, options)
            );
    }
}
