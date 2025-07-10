import { Command } from 'commander';
import { formatString } from '../util/formatter';
import { getMinecraftJarInfo } from '../util/jarInfo';
import { AppCommand } from './AppCommand';

const jarInfoCommand = (jarPath: string) => {
    const info = getMinecraftJarInfo(jarPath);

    if (!info) {
        console.error(formatString('&cNo valid jar file found.'));
        return;
    }

    if (info.software === null) {
        console.error(formatString('&cUnknown server software.'));
        return;
    }

    console.log(info.software + (info.version ? ` ${info.version}` : ''));
};

export class JarInfoCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('jarinfo <jarPath>')
            .description('Get information about a Minecraft server jar file')
            .action((jarPath: string) => {
                jarInfoCommand(jarPath);
            });
    }
}
