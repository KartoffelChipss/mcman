import path from 'path';
import { getServerByName } from '../util/config/serverConfigManager';
import { logFormatted } from '../util/formatter';
import { openInDefaultApp } from '../util/processHelper';
import { AppCommand } from './AppCommand';
import { Command } from 'commander';

interface OpenDirCommandOptions {
    path?: boolean;
}

const openDirCommand = (name: string, options: OpenDirCommandOptions) => {
    const server = getServerByName(name, true);

    if (!server) {
        logFormatted(`&cServer not found: "${name}"`);
        return;
    }

    if (options.path) {
        logFormatted(`${path.dirname(server.serverJar)}`);
        return;
    }

    openInDefaultApp(path.dirname(server.serverJar));

    logFormatted(`&aOpened server directory for "${name}"`);
};

export class OpenDirCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('open-dir <name>')
            .description('Open the directory of a saved server')
            .option('-p, --path', 'Print the path instead of opening it')
            .alias('od')
            .action((name: string, options: OpenDirCommandOptions) =>
                openDirCommand(name, options)
            );
    }
}
