import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { openInDefaultApp } from '../processHelper';

export class AppConfig {
    private configPath: string;
    private config: Record<string, any> | null;

    constructor(
        private configFileName: string = '.mcman.json',
        private defaultConfig: Record<string, any> = {}
    ) {
        const homeDir = os.homedir();
        this.configPath = path.join(homeDir, this.configFileName);

        if (fs.existsSync(this.configPath)) {
            this.config = this.loadConfig();
        } else {
            this.config = { ...this.defaultConfig };
            this.saveConfig();
        }
    }

    private loadConfig(): Record<string, any> {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        return JSON.parse(fileContent);
    }

    private saveConfig(): void {
        const jsonContent = JSON.stringify(this.config, null, 4);
        fs.writeFileSync(this.configPath, jsonContent, 'utf8');
    }

    public get(key: string): any {
        if (this.config === null) {
            if (key in this.defaultConfig) {
                return this.defaultConfig[key];
            }

            return undefined;
        }

        if (key in this.config) {
            return this.config[key];
        }
        if (key in this.defaultConfig) {
            return this.defaultConfig[key];
        }
        return undefined;
    }

    public set(key: string, value: any): void {
        if (this.config === null) {
            return;
        }
        this.config[key] = value;
        this.saveConfig();
    }

    public getAll(): Record<string, any> {
        return { ...this.config, ...this.defaultConfig };
    }

    public reset(): void {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
    }

    public getConfigPath(): string {
        return this.configPath;
    }

    public async openInEditor(): Promise<void> {
        await openInDefaultApp(this.configPath);
    }
}
