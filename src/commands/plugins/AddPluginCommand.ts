import { Command } from 'commander';
import { AppCommand } from '../AppCommand';
import { getServerByName } from '../../util/config/serverConfigManager';
import { logFormatted } from '../../util/formatter';
import {
    Facet,
    FacetGroup,
    FacetOperation,
    FacetType,
    Modrinth,
    SearchFacets,
    SearchHit,
    SearchIndex
} from 'typerinth';
import ora from 'ora';
import inquirer from 'inquirer';
import { getMinecraftJarInfo } from '../../util/jarInfo';
import path from 'path';
import { downloadFile } from '../../util/downloads';

const addPlugin = async (serverName: string, plugin: string) => {
    const server = getServerByName(serverName, true);

    if (!server) {
        logFormatted(`&cServer not found: "${serverName}"`);
        return;
    }

    const serverInfo = getMinecraftJarInfo(server.serverJar);

    const spinner = ora(`Searching for plugin "${plugin}"...`).start();

    const modrinth = new Modrinth();

    const facetGroups = [
        new FacetGroup(
            new Facet(FacetType.ProjectType, FacetOperation.Equals, 'plugin')
        )
    ];

    if (serverInfo?.software) {
        facetGroups.push(
            new FacetGroup(
                new Facet(
                    FacetType.Categories,
                    FacetOperation.Equals,
                    serverInfo.software.toLowerCase()
                )
            )
        );
    }

    if (serverInfo?.version) {
        facetGroups.push(
            new FacetGroup(
                new Facet(
                    FacetType.Versions,
                    FacetOperation.Equals,
                    serverInfo.version
                )
            )
        );
    }

    const searchResults = await modrinth.search(plugin, {
        limit: 10,
        index: SearchIndex.Relevance,
        facets: new SearchFacets(...facetGroups)
    });

    if (searchResults.hits.length === 0) {
        spinner.fail(`No plugins found matching "${plugin}"`);
        return;
    }

    spinner.succeed(`Found ${searchResults.hits.length} plugin(s)`);

    const { selectServerSoftware } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectServerSoftware',
            message: `Choose a server software:`,
            choices: searchResults.hits.map((hit) => ({
                name: hit.title,
                value: hit
            }))
        }
    ]);

    const selectedPlugin: SearchHit = selectServerSoftware;

    spinner.start(`Fetching latest version for ${selectedPlugin.title}...`);

    const latestVersion = await modrinth.getProjectVersions(
        selectedPlugin.project_id,
        {
            game_versions: [serverInfo?.version || ''],
            loaders: [serverInfo?.software?.toLowerCase() || '']
        }
    );

    if (latestVersion.length === 0) {
        spinner.fail(
            `No compatible versions found for ${selectedPlugin.title}`
        );
        return;
    }

    const selectedVersion = latestVersion[0];

    spinner.succeed(
        `Latest version for "${selectedPlugin.title}": ${selectedVersion.version_number}`
    );

    const downloadUrl = selectedVersion.files[0].url;

    spinner.start(`Downloading plugin "${selectedPlugin.title}"...`);

    const pluginDir = path.join(path.dirname(server.serverJar), 'plugins');

    await downloadFile(
        downloadUrl,
        pluginDir,
        selectedVersion.files[0].filename
    );

    spinner.succeed(
        `${selectedPlugin.title} version ${selectedVersion.version_number} added to server "${serverName}"`
    );
};

export class AddPluginCommand extends AppCommand {
    register(program: Command): void {
        program
            .command('add <server> <plugin>')
            .description('Add a plugin to a server')
            .action((server: string, plugin: string) =>
                addPlugin(server, plugin)
            );
    }
}
