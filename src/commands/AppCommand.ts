import { Command } from 'commander';

export abstract class AppCommand {
    abstract register(program: Command): void;
}
