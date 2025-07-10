import { Command } from 'commander';
import { AppCommand } from '../AppCommand';
import helpConfig from '../../util/helpConfig';
import { ListPluginsCommand } from './ListPluginsCommand';
import { AddPluginCommand } from './AddPluginCommand';

export class PluginsCommand extends AppCommand {
    register(program: Command): void {
        const pluginsCommand = new Command('plugins');

        pluginsCommand
            .alias('pl')
            .description('Manage plugins for a specific server')
            .action(() => pluginsCommand.help())
            .configureHelp(helpConfig);

        const subCommands: AppCommand[] = [
            new ListPluginsCommand(),
            new AddPluginCommand()
        ];

        subCommands.forEach((c) => c.register(pluginsCommand));

        pluginsCommand
            .command('help')
            .description('Display help information for the plugins command')
            .action(() => pluginsCommand.help());

        program.addCommand(pluginsCommand);
    }
}
