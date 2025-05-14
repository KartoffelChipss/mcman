import inquirer from 'inquirer';
import * as fs from 'fs';
import { createHash } from 'crypto';
import ora from 'ora';
import {
    getBuildInfo,
    getBuilds,
    getProjectList,
    getVersions,
    ProjectBuildResponse,
    VersionResponse
} from '../util/papeApi';
import { logFormatted, logTable } from '../util/formatter';
import { downloadFile } from '../util/downloads';
import path from 'path';
import {
    writeEulaFile,
    writePropertiesFile,
    writeWaterfallConfig
} from '../util/fileWriter';
import { addServer, getServerByName } from '../util/config/serverConfigManager';
import { isMinecraftProxy } from '../util/jarInfo';

export interface InitCommandOptions {
    mcVersion?: string;
    build?: string;
    acceptEula?: boolean;
    port?: number;
    onlineMode?: boolean;
}

export const initCommand = async (
    workingDir: string | undefined,
    options: InitCommandOptions
) => {
    const cwd = workingDir ? path.resolve(workingDir) : process.cwd();

    const serverSoftware = await selectServerSoftware();
    const isProxy = isMinecraftProxy(serverSoftware);

    const availableVersions = await fetchAvailableVersions(serverSoftware);
    if (!availableVersions) return;

    const selectedGroup = await selectVersionGroup(availableVersions);
    if (!selectedGroup) return;

    const selectedVersion = await selectVersionFromGroup(
        availableVersions,
        selectedGroup
    );
    if (!selectedVersion) return;

    const selectedBuild = await selectBuild(serverSoftware, selectedVersion);
    if (!selectedBuild) return;

    const buildInfo = await fetchBuildInfo(
        serverSoftware,
        selectedVersion,
        selectedBuild
    );
    if (!buildInfo) return;

    const defaultPort = isProxy ? 25577 : 25565;

    let shouldAcceptEula = null;
    let port = null;
    let onlineMode = null;

    if (!isProxy || serverSoftware === 'waterfall') {
        port =
            options.port === undefined
                ? await getPort(defaultPort)
                : options.port;
    }

    if (!isProxy) {
        shouldAcceptEula =
            options.acceptEula === undefined
                ? await getShouldAcceptEula()
                : options.acceptEula;

        onlineMode =
            options.onlineMode === undefined
                ? await getShouldUseOnlineMode()
                : options.onlineMode;
    }

    await printInfoOverview(
        cwd,
        serverSoftware,
        selectedVersion,
        selectedBuild,
        shouldAcceptEula,
        port,
        onlineMode
    );

    const shouldContinue = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'continue',
            message: 'Continue with the selected options?',
            default: true
        }
    ]);

    if (!shouldContinue.continue) {
        logFormatted('&cAborted');
        process.exit(1);
    }

    if (!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

    if (!isProxy) {
        const fileSpinner = ora('Creating server files...').start();

        await writeEulaFile(cwd, shouldAcceptEula);

        await writePropertiesFile(cwd, port, onlineMode);

        fileSpinner.succeed('Server files created successfully.');
    }

    if (serverSoftware === 'waterfall') {
        await writeWaterfallConfig(cwd, port);
    }

    await downloadAndVerifyJar(
        serverSoftware,
        selectedVersion,
        selectedBuild,
        buildInfo,
        cwd
    );

    const shouldSaveServer = await getShouldSaveServer();

    if (!shouldSaveServer) {
        logFormatted('&aServer setup complete!');
        process.exit(0);
    }

    const serverName = await getServerName(path.basename(cwd));

    const saveSpinner = ora('Saving server configuration...').start();

    addServer({
        name: serverName,
        serverJar: path.resolve(cwd, 'server.jar'),
        pid: null
    });

    saveSpinner.succeed('Server configuration saved successfully!');

    logFormatted('&aServer setup complete!');

    process.exit(0);
};

const getServerName = async (defaultName: string) => {
    let serverName: string | null = null;

    while (!serverName) {
        const { name } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter a name for the server:',
                default: defaultName
            }
        ]);

        if (name.trim() === '') {
            logFormatted('&eServer name cannot be empty');
            continue;
        }

        if (getServerByName(name, true)) {
            logFormatted(`&eServer with name "${name}" already exists`);
            continue;
        }

        serverName = name;
    }

    return serverName;
};

const getShouldSaveServer = async () => {
    const { saveServer } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'saveServer',
            message: 'Save the server configuration?',
            default: true
        }
    ]);

    return saveServer;
};

const getShouldAcceptEula = async () => {
    const { acceptEula } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'acceptEula',
            message: 'Do you accept the Minecraft EULA?',
            default: true
        }
    ]);

    return acceptEula;
};

const getPort = async (defaultPort: number = 25565) => {
    const { port } = await inquirer.prompt([
        {
            type: 'number',
            name: 'port',
            message: 'Enter the port to run the server on:',
            default: defaultPort
        }
    ]);

    return port;
};

const getShouldUseOnlineMode = async () => {
    const { onlineMode } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'onlineMode',
            message: 'Enable online mode?',
            default: true
        }
    ]);

    return onlineMode;
};

const selectServerSoftware = async (): Promise<string> => {
    const spinner = ora(`Fetching available server software...`).start();
    const availableSoftware = await getProjectList();
    spinner.stop();

    if (availableSoftware === null) {
        logFormatted('&cNo data available to select software');
        return 'paper';
    }

    const priority = ['paper', 'velocity', 'folia', 'waterfall'];
    const sortedSoftware = [
        ...priority.filter((p) => availableSoftware.includes(p)),
        ...availableSoftware.filter((s) => !priority.includes(s))
    ];

    const defaultSoftware = sortedSoftware[0];

    const { selectServerSoftware } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectServerSoftware',
            message: `Choose a server software:`,
            choices: sortedSoftware,
            default: defaultSoftware
        }
    ]);

    return selectServerSoftware;
};

const fetchAvailableVersions = async (project: string) => {
    const spinner = ora('Fetching available Paper versions...').start();
    const availablePaperVersions = await getVersions(project);
    spinner.stop();

    if (availablePaperVersions === null) {
        logFormatted('&cNo data available to select versions');
        return null;
    }

    return availablePaperVersions;
};

const selectVersionGroup = async (availablePaperVersions: VersionResponse) => {
    const availableVersionGroups = Array.from(
        new Set(
            availablePaperVersions.versions.map((version) => {
                const parts = version.split('.');
                return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : version;
            })
        )
    ).reverse();
    const latestVersionGroup = availableVersionGroups[0];

    const { selectedGroup } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedGroup',
            message: 'Choose a version group:',
            choices: availableVersionGroups,
            default: latestVersionGroup
        }
    ]);

    return selectedGroup;
};

const selectVersionFromGroup = async (
    availablePaperVersions: VersionResponse,
    selectedGroup: string
) => {
    const filteredVersions = availablePaperVersions.versions.filter((version) =>
        version.includes(selectedGroup)
    );

    if (filteredVersions.length === 0) {
        logFormatted(`&eNo versions found for group: ${selectedGroup}`);
        return null;
    }

    const latestVersion = filteredVersions[filteredVersions.length - 1];

    const { selectedVersion } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedVersion',
            message: `Choose a version from the "${selectedGroup}" group:`,
            choices: filteredVersions,
            default: latestVersion
        }
    ]);

    return selectedVersion;
};

const selectBuild = async (project: string, selectedVersion: string) => {
    const spinner = ora(
        `Fetching builds for version ${selectedVersion}...`
    ).start();
    const availableBuildsRaw = await getBuilds(project, selectedVersion);
    spinner.stop();

    if (availableBuildsRaw === null) {
        logFormatted('&cNo data available to select builds');
        return null;
    }

    const availableBuilds = availableBuildsRaw.builds
        .reverse()
        .map((build) => build.toString());
    const defaultBuild = availableBuilds[0];

    const { selectedBuild } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedBuild',
            message: `Choose a build for version ${selectedVersion}:`,
            choices: availableBuilds,
            default: defaultBuild
        }
    ]);

    return selectedBuild;
};

const fetchBuildInfo = async (
    project: string,
    selectedVersion: string,
    selectedBuild: string
) => {
    const spinner = ora(
        `Fetching build info for version ${selectedVersion}, build ${selectedBuild}...`
    ).start();
    const buildInfo = await getBuildInfo(
        project,
        selectedVersion,
        selectedBuild
    );
    spinner.stop();

    if (buildInfo === null) {
        logFormatted('&cNo build info available');
        return null;
    }

    return buildInfo;
};

const downloadAndVerifyJar = async (
    project: string,
    selectedVersion: string,
    selectedBuild: string,
    buildInfo: ProjectBuildResponse,
    cwd: string
) => {
    const downloadSuccess = await downloadJar(
        project,
        selectedVersion,
        selectedBuild,
        buildInfo.downloads.application.name,
        'server.jar',
        buildInfo.downloads.application.sha256,
        cwd
    );

    if (!downloadSuccess) {
        logFormatted('&cFailed to download Paper jar');
        return;
    }

    logFormatted('&aPaper jar downloaded successfully');
};

async function downloadJar(
    project: string,
    version: string,
    build: string | number,
    fileName: string,
    targetFileName: string,
    sha256: string,
    targetPath: string
): Promise<boolean> {
    const jarUrl = `https://api.papermc.io/v2/projects/${project}/versions/${version}/builds/${build}/downloads/${fileName}`;
    const spinner = ora(`Downloading ${fileName}...`).start();

    try {
        await downloadFile(jarUrl, targetPath, targetFileName);
        spinner.succeed(`Downloaded ${fileName} successfully.`);
    } catch (error) {
        spinner.fail(`Failed to download ${fileName}: ${error}`);
        return false;
    }

    const targetFile = path.resolve(targetPath, targetFileName);

    try {
        spinner.text = 'Verifying file hash...';
        const hash = createHash('sha256');
        const fileStream = fs.createReadStream(targetFile);

        return new Promise((resolve) => {
            fileStream.on('data', (data) => {
                hash.update(data);
            });

            fileStream.on('end', () => {
                const fileHash = hash.digest('hex');
                if (fileHash === sha256) {
                    spinner.succeed('File hash verified successfully.');
                    resolve(true);
                } else {
                    spinner.fail('File hash mismatch.');
                    resolve(false);
                }
            });

            fileStream.on('error', (error) => {
                spinner.fail('Error reading file for hash verification.');
                console.error('Error checking file hash:', error);
                resolve(false);
            });
        });
    } catch (error) {
        spinner.fail('Error checking file hash.');
        console.error('Error checking file hash:', error);
        return false;
    }
}

const printInfoOverview = async (
    targetDir: string,
    serverSoftware: string,
    selectedVersion: string,
    selectedBuild: string,
    acceptEula: string | null,
    port: number | null,
    onlineMode: boolean | null
) => {
    logFormatted('');

    const rows: string[][] = [
        ['&bTarget directory', '&7' + targetDir],
        [
            '&bSoftware',
            '&7' +
                serverSoftware +
                ' ' +
                selectedVersion +
                ', build ' +
                selectedBuild
        ]
    ];
    if (acceptEula !== null) rows.push(['&bAccept EULA', '&7' + acceptEula]);
    if (port !== null) rows.push(['&bPort', '&7' + port]);
    if (onlineMode !== null) rows.push(['&bOnline mode', '&7' + onlineMode]);

    logTable(rows, {
        gapBetweenColumns: 5
    });

    logFormatted('');
};
