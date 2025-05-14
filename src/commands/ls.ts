import path from 'path';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted, logTable } from '../util/formatter';
import { isProcessRunning } from '../util/processHelper';
import { ServerConfig } from '../util/config/serverConfigManager';
import pidusage from 'pidusage';
import os from 'os';
import { getMinecraftJarInfo } from '../util/jarInfo';
import { existsSync } from 'fs';

export const lsCommand = async () => {
    const servers = appConfig.get('servers');

    if (servers.length === 0) {
        logFormatted('&cNo servers found!');
        return;
    }

    const totalCores = os.cpus().length;

    const serverDataPromises = servers.map(async (server: ServerConfig) => {
        let pidStatus = '&fN/A';
        let status = '&c● Stopped';
        let memory = 'N/A';
        let cpu = 'N/A';
        let uptime = 'N/A';

        if (server.pid && isProcessRunning(server.pid)) {
            pidStatus = '&f' + server.pid;
            status = '&a● Running';

            try {
                const stats = await pidusage(server.pid);
                memory = (stats.memory / 1024 / 1024).toFixed(0) + ' MB';
                cpu = Math.min(stats.cpu / totalCores, 100).toFixed(2) + '%';
                uptime = formatUptime(stats.elapsed / 1000);
            } catch (error) {
                memory = 'Error';
                cpu = 'Error';
                uptime = 'Error';
            }
        }

        const serverJarExists = existsSync(server.serverJar);
        const jarExistsExtension = serverJarExists ? '' : '&e ‼';

        const serverJarInfo = getMinecraftJarInfo(server.serverJar);
        let formattedServerType = '';
        if (serverJarInfo) {
            formattedServerType =
                serverJarInfo.software +
                (serverJarInfo.version ? ` ${serverJarInfo.version}` : '');
        } else {
            formattedServerType = 'Unknown';
        }

        return [
            server.name + jarExistsExtension, // Name
            pidStatus, // PID
            status, // Status
            '&f' + path.basename(path.dirname(server.serverJar)), // Folder
            '&f' + formattedServerType, // Server Type
            '&f' + memory, // Memory
            '&f' + cpu, // CPU
            '&f' + uptime // Uptime
        ];
    });

    const serverData = await Promise.all(serverDataPromises);

    logTable(
        [
            [
                'Name',
                'PID',
                'Status',
                'Folder',
                'Server Type',
                'Memory',
                'CPU',
                'Uptime'
            ]
        ].concat(serverData),
        {
            headerSeparator: true,
            firstColumnLine: true,
            gapBetweenColumns: 5,
            lineFormat: '&8'
        }
    );
};

const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let formattedUptime = '';
    if (days > 0) formattedUptime += `${days}d `;
    if (hours > 0) formattedUptime += `${hours}h `;
    if (minutes > 0) formattedUptime += `${minutes}m `;
    if (remainingSeconds > 0) formattedUptime += `${remainingSeconds}s`;

    const parts = formattedUptime.trim().split(' ');
    return parts.slice(0, 2).join(' ');
};
