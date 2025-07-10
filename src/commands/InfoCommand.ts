import { Command } from 'commander';
import { AppCommand } from './AppCommand';
import path from 'path';
import { getServerByName } from '../util/config/serverConfigManager';
import { logFormatted } from '../util/formatter';
import { getMinecraftJarInfo } from '../util/jarInfo';

const infoCommand = (name: string) => {
    const server = getServerByName(name, true);

    if (!server) {
        logFormatted(`&cServer not found: "${name}"`);
        return;
    }

    const serverJarInfo = getMinecraftJarInfo(server.serverJar);
    let formattedServerType = '';
    if (serverJarInfo) {
        formattedServerType =
            serverJarInfo.software +
            (serverJarInfo.version ? ` ${serverJarInfo.version}` : '');
    } else {
        formattedServerType = 'Unknown';
    }

    logFormatted(`&fName: &b${server.name}`);
    logFormatted(`&fServer Software: &b${formattedServerType}`);
    logFormatted(`&fPath: &b${path.dirname(server.serverJar)}`);
};

export class InfoCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('info <name>')
            .description('Get information about a saved server')
            .action((name: string) => infoCommand(name));
    }
}
