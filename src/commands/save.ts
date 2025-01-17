import path from 'path';
import * as fs from 'fs';
import inquirer from 'inquirer';
import { logFormatted } from '../util/formatter';
import { appConfig } from '../util/config/mainConfig';

export interface SaveCommandOptions {
    name?: string;
}

export const saveCommand = async (
    workingDir: string | undefined,
    options: SaveCommandOptions
) => {
    const cwd = workingDir ? path.resolve(workingDir) : process.cwd();
    const name = options.name === undefined ? path.basename(cwd) : options.name;

    const serverJar = await findServerJar(cwd);

    if (!serverJar) {
        logFormatted('&cNo jar files found in the current directory!');
        process.exit(1);
    }

    const servers = appConfig.get('servers');
    const serverIndex = servers.findIndex(
        (server: any) => server.name.toLowerCase() === name.toLowerCase()
    );

    if (serverIndex !== -1) {
        const shouldOverride = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'override',
                message:
                    'A server with this name already exists. Do you want to override it?',
                default: false
            }
        ]);

        if (!shouldOverride.override) {
            logFormatted('&cAborted');
            process.exit(1);
        }

        servers.splice(serverIndex, 1);
    }

    servers.push({
        name,
        serverJar
    });

    appConfig.set('servers', servers);

    logFormatted(`&aServer ${name} saved successfully!`);
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
