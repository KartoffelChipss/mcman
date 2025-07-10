import { Command } from 'commander';
import { AppCommand } from '../AppCommand';
import { getServerByName } from '../../util/config/serverConfigManager';
import { logFormatted } from '../../util/formatter';
import { Modrinth } from 'typerinth';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import ora from 'ora';

function hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha512');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

async function getAllJars(dir: string): Promise<string[]> {
    let files = await fs.promises.readdir(dir, { withFileTypes: true });
    let paths = [];

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (!file.isDirectory() && fullPath.endsWith('.jar'))
            paths.push(fullPath);
    }

    return paths;
}

const listPlugins = async (serverName: string) => {
    const server = getServerByName(serverName, true);

    if (!server) {
        logFormatted(`&cServer not found: "${serverName}"`);
        return;
    }

    const spinner = ora(`Fetching plugins...`).start();
    const start = Date.now();

    const serverPath = path.dirname(server.serverJar);
    const pluginsDir = path.join(serverPath, 'plugins');

    const modrinth = new Modrinth();

    try {
        const files = await getAllJars(pluginsDir);

        const promises = files.map(async (filePath) => {
            try {
                const hash = await hashFile(filePath);
                const version = await modrinth.getVersionFromFileHash(hash, {
                    algorithm: 'sha512'
                });
                return { filePath, version };
            } catch (err) {
                return { filePath, version: null };
            }
        });

        const results = await Promise.all(promises);

        const duration = Date.now() - start;

        spinner.succeed(`Found ${results.length} plugins in ${duration}ms`);

        for (const { filePath, version } of results) {
            if (version) {
                logFormatted(
                    `&a${version.name} &f- ${path.basename(filePath)}`
                );
            } else {
                logFormatted(`&eunknown &f- ${path.basename(filePath)}`);
            }
        }
    } catch (err) {
        logFormatted('&cError:', err);
    }
};

export class ListPluginsCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('list <server>')
            .alias('ls')
            .description('List all plugins for a server')
            .action((server: string) => listPlugins(server));
    }
}
