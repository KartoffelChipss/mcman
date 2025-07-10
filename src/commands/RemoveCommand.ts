import { Command } from 'commander';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted } from '../util/formatter';
import { AppCommand } from './AppCommand';

const rmCommand = async (name: string) => {
    const servers = appConfig.get('servers');
    const serverIndex = servers.findIndex(
        (server: any) => server.name === name
    );

    if (serverIndex === -1) {
        logFormatted('&cNo server found with that name!');
        process.exit(1);
    }

    servers.splice(serverIndex, 1);

    appConfig.set('servers', servers);

    logFormatted(`&aServer ${name} removed successfully!`);
};

export class RemoveCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('remove <name>')
            .alias('rm')
            .description('Remove a saved server')
            .action((name: string) => rmCommand(name));
    }
}
