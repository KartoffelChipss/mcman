#!/usr/bin/env bun

import { Command } from 'commander';
import helpConfig from './util/helpConfig';
import { initCommand, InitCommandOptions } from './commands/init';
import { logFormatted, logTable } from './util/formatter';

const program = new Command();

program
    .name('mcman')
    .version('0.0.1')
    .description('Easily manage multiple java versions from the command line')
    .action(() => {
        program.help();
    })
    .configureHelp(helpConfig);

program
    .command('init [path]')
    .description('Initialize a new project with a specific Minecraft version')
    .option('-v, --mc-version <version>', 'Specify the Minecraft version')
    .option('-b, --build <build>', 'Specify the build to download')
    .option('-e, --accept-eula', 'Accept the Minecraft EULA')
    .option('-p, --port <port>', 'Specify the port to run the server on')
    .option('-o, --online-mode', 'Enable online mode')
    .action((path: string | undefined, options: InitCommandOptions) =>
        initCommand(path, options)
    );

program
    .command('help')
    .description('Display help information for mcman')
    .action(() => {
        program.help();
    });

program.parse(process.argv);
