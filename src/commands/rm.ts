import { appConfig } from '../util/config/mainConfig';
import { logFormatted } from '../util/formatter';

export const rmCommand = async (name: string) => {
    const servers = appConfig.get('servers');
    const serverIndex = servers.findIndex(
        (server: any) => server.name === name
    );

    if (serverIndex === -1) {
        logFormatted('&cNo server found with that name!');
        process.exit(1);
    }

    servers.splice(serverIndex, 1);

    appConfig.set('servers', servers);

    logFormatted(`&aServer ${name} removed successfully!`);
};
