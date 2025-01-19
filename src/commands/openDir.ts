import path from "path";
import { getServerByName } from "../util/config/serverConfigManager"
import { logFormatted } from "../util/formatter";
import { openInDefaultApp } from "../util/processHelper";

export interface OpenDirCommandOptions {
    path?: boolean;
}

export const openDirCommand = (name: string, options: OpenDirCommandOptions) => {
    const server = getServerByName(name, true);

    if (!server) {
        logFormatted(`&cServer not found: "${name}"`);
        return;
    }

    if (options.path) {
        logFormatted(`${path.dirname(server.serverJar)}`);
        return;
    }

    openInDefaultApp(path.dirname(server.serverJar))

    logFormatted(`&aOpened server directory for "${name}"`);
}