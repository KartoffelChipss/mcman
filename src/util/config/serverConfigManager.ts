import { appConfig } from './mainConfig';

export interface ServerConfig {
    name: string;
    serverJar: string;
    pid: number|null;
}

/**
 * Add a server to the config
 * @param server The server to add
 * @param force Whether to overwrite an existing server with the same name
 * @returns void
 */
export const addServer = (server: ServerConfig, force?: boolean): void => {
    const servers = appConfig.get('servers');
    
    if (!servers) {
        appConfig.set('servers', [server]);
        return;
    }

    if (servers.some((s: ServerConfig) => s.name === server.name)) {
        if (!force) {
            throw new Error('Server with that name already exists!');
        }

        servers.splice(servers.findIndex((s: ServerConfig) => s.name === server.name), 1);
    }

    servers.push(server);
    appConfig.set('servers', servers);
}

/**
 * Remove a server from the config
 * @param name The name of the server to remove
 * @returns void
 */
export const removeServer = (name: string): void => {
    const servers = appConfig.get('servers');

    if (!servers) {
        throw new Error('No servers to remove!');
    }

    if (!servers.some((s: ServerConfig) => s.name === name)) {
        throw new Error('No server with that name found!');
    }

    appConfig.set('servers', servers.filter((s: ServerConfig) => s.name !== name));
}

export const updateServer = (server: ServerConfig, ignoreCase?: boolean): void => {
    const servers = appConfig.get('servers');

    if (!servers) {
        throw new Error('No servers to update!');
    }

    if (!servers.some((s: ServerConfig) => ignoreCase ? s.name.toLowerCase() === server.name.toLowerCase() : s.name === server.name)) {
        throw new Error('No server with that name found!');
    }

    appConfig.set('servers', servers.map((s: ServerConfig) => {
        if (ignoreCase ? s.name.toLowerCase() === server.name.toLowerCase() : s.name === server.name) return server;
        else return s;
    }));
}

/**
 * Get all servers in the config
 * @returns ServerConfig[]
 */
export const getServers = (): ServerConfig[] => {
    return appConfig.get('servers') || [];
}

/**
 * Get a server from the config by name
 * @param name The name of the server to get
 * @returns ServerConfig
 */
export const getServerByName = (name: string, ignoreCase?: boolean): ServerConfig | undefined => {
    return getServers().find((s: ServerConfig) => ignoreCase ? s.name.toLowerCase() === name.toLowerCase() : s.name === name);
}

/**
 * Get a server from the config by PID
 * @param pid The PID of the server to get
 * @returns ServerConfig
 */
export const getServerByPid = (pid: number): ServerConfig | undefined => {
    return getServers().find((s: ServerConfig) => s.pid === pid);
}
