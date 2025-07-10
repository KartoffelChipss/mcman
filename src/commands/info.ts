import path from 'path';
import { getServerByName } from '../util/config/serverConfigManager';
import { logFormatted } from '../util/formatter';
import { getMinecraftJarInfo } from '../util/jarInfo';

export const infoCommand = (name: string) => {
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
