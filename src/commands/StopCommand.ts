import { Command } from 'commander';
import { getServerByName } from '../util/config/serverConfigManager';
import { logFormatted } from '../util/formatter';
import { isProcessRunning } from '../util/processHelper';
import { AppCommand } from './AppCommand';

const stopCommand = async (name: string) => {
    const server = getServerByName(name, true);

    if (!server) {
        logFormatted(`&cNo server with that name found: ${name}`);
        return;
    }

    if (!server.pid || !isProcessRunning(server.pid)) {
        logFormatted(`&cServer is not running: ${name}`);
        return;
    }

    process.kill(server.pid);
    logFormatted(`&aServer stopped: ${name}`);
    return;
};

export class StopCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('stop <name>')
            .description('Stop a running server')
            .action((name: string) => stopCommand(name));
    }
}
