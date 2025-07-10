import { Command } from 'commander';
import { AppCommand } from './AppCommand';
import { appConfig } from '../util/config/mainConfig';

export class ConfigCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('config')
            .description('Open the configuration file in the default editor')
            .option(
                '-e, --edit',
                'Open the configuration file in the default editor'
            )
            .action((options) => {
                if (options.edit) appConfig.openInEditor();
                else console.log(appConfig.getConfigPath());
            });
    }
}
