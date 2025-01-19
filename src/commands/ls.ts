import path from 'path';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted, logTable } from '../util/formatter';
import { isProcessRunning } from '../util/processHelper';
import { ServerConfig } from '../util/config/serverConfigManager';

export const lsCommand = async () => {
    const servers = appConfig.get('servers');
    if (servers.length === 0) {
        logFormatted('&cNo servers found!');
        return;
    }
    logTable(
        [['Name', 'PID', 'Status', 'Folder', 'Server Jar']].concat(
            servers.map((server: ServerConfig) => [
                server.name,
                '&f' + (isProcessRunning(server.pid) ? server.pid : 'N/A'),
                isProcessRunning(server.pid) ? '&a● Running' : '&c● Stopped',
                '&f' + path.basename(path.dirname(server.serverJar)),
                '&f' + path.basename(server.serverJar)
            ])
        ),
        {
            headerSeparator: true,
            firstColumnLine: true,
            gapBetweenColumns: 5,
            lineFormat: '&8'
        }
    );
};
