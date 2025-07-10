#!/usr/bin/env bun

import { Command } from 'commander';
import helpConfig from './util/helpConfig';
import {
    InfoCommand,
    InitCommand,
    JarInfoCommand,
    ListCommand,
    OpenDirCommand,
    RemoveCommand,
    SaveCommand,
    StartCommand,
    StopCommand,
    ConfigCommand,
    PluginsCommand,
    AppCommand
} from './commands';
import './util/config/mainConfig';

const VERSION = '1.2.0';

const program = new Command();

program
    .name('mcman')
    .version(VERSION)
    .description('Easily manage multiple java versions from the command line')
    .action(() => program.help())
    .configureHelp(helpConfig);

const commands: AppCommand[] = [
    new InitCommand(),
    new SaveCommand(),
    new StartCommand(),
    new StopCommand(),
    new ListCommand(),
    new RemoveCommand(),
    new InfoCommand(),
    new OpenDirCommand(),
    new PluginsCommand(),
    new JarInfoCommand(),
    new ConfigCommand()
];

commands.forEach((command) => command.register(program));

program
    .command('help')
    .description('Display help information for mcman')
    .action(() => program.help());

program.parse(process.argv);
