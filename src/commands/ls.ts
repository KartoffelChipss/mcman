import path from 'path';
import { appConfig } from '../util/config/mainConfig';
import { logFormatted, logTable } from '../util/formatter';

export const lsCommand = async () => {
    const servers = appConfig.get('servers');
    if (servers.length === 0) {
        logFormatted('&cNo servers found!');
        return;
    }
    logTable(
        [['Name', 'Folder', 'Server Jar']].concat(
            servers.map((server: any) => [
                server.name,
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
