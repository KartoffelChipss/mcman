#!/usr/bin/env bun

import { Command } from 'commander';
import helpConfig from './util/helpConfig';
import { initCommand, InitCommandOptions } from './commands/init';
import './util/config/mainConfig';
import { appConfig } from './util/config/mainConfig';
import { saveCommand, SaveCommandOptions } from './commands/save';
import { lsCommand } from './commands/ls';
import { rmCommand } from './commands/rm';
import { startCommand, StartCommandOptions } from './commands/start';
import { stopCommand } from './commands/stop';
import { openDirCommand, OpenDirCommandOptions } from './commands/openDir';

const VERSION = '1.1.0';

const program = new Command();

program
    .name('mcman')
    .version(VERSION)
    .description('Easily manage multiple java versions from the command line')
    .action(() => program.help())
    .configureHelp(helpConfig);

program
    .command('init [path]')
    .description('Initialize a new Minecraft server')
    .option('-v, --mc-version <version>', 'Specify the Minecraft version')
    .option('-b, --build <build>', 'Specify the build to download')
    .option('-e, --accept-eula', 'Accept the Minecraft EULA')
    .option('-p, --port <port>', 'Specify the port to run the server on')
    .option('-o, --online-mode', 'Enable online mode')
    .action((path: string | undefined, options: InitCommandOptions) =>
        initCommand(path, options)
    );

program
    .command('start [name]')
    .description('Start a server')
    .option('--flags <flags>', 'Specify the Java flags to use')
    .option('--gui', 'Open the server GUI')
    .option('-m, --memory <memory>', 'Specify the amount of memory to allocate')
    .action((name: string | undefined, options: StartCommandOptions) =>
        startCommand(name, options)
    );

program
    .command('save [path]')
    .description('Save the current directory as a server')
    .option('-n, --name <name>', 'Specify the name of the server')
    .action((path: string | undefined, options: SaveCommandOptions) =>
        saveCommand(path, options)
    );

program
    .command('stop <name>')
    .description('Stop a running server')
    .action((name: string) => stopCommand(name));

program
    .command('list')
    .alias('ls')
    .description('List all saved servers')
    .action(() => lsCommand());

program
    .command('remove <name>')
    .alias('rm')
    .description('Remove a saved server')
    .action((name: string) => rmCommand(name));

program
    .command('open-dir <name>')
    .description('Open the directory of a saved server')
    .option('-p, --path', 'Print the path instead of opening it')
    .alias('od')
    .action((name: string, options: OpenDirCommandOptions) => openDirCommand(name, options));

program
    .command('config')
    .description('Open the configuration file in the default editor')
    .action(() => appConfig.openInEditor());

program
    .command('help')
    .description('Display help information for mcman')
    .action(() => program.help());

program.parse(process.argv);
