import { logFormatted } from '../../formatter';
import { getCachedBuilds, setCachedBuilds } from '../cache';
import {
    Build,
    BuildsResponse,
    ProjectBuildResponse,
    projectNamesMap
} from '../paperTypes';

export async function getBuilds(
    project: string,
    version: string
): Promise<BuildsResponse | null> {
    const apiUrl = `https://fill.papermc.io/v3/projects/${project}/versions/${version}/builds`;

    try {
        if (!getCachedBuilds()) {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch data from PaperMC API');
            }

            setCachedBuilds(await response.json());
        }

        const projectBuilds = getCachedBuilds();

        if (!projectBuilds || !Array.isArray(projectBuilds)) {
            console.error('Invalid builds data format:', projectBuilds);
            return null;
        }

        const builds: number[] = projectBuilds.map((build: Build) => build.id);

        // sort builds in ascending order
        builds.sort((a, b) => a - b);

        if (builds.length === 0) {
            console.warn(
                `No builds found for project ${project} version ${version}`
            );
            return null;
        }

        return {
            project_id: project,
            project_name: projectNamesMap[project] || project,
            version: version,
            builds: builds
        } as BuildsResponse;
    } catch (error) {
        logFormatted('&cError fetching builds:', error);
        return null;
    }
}

export async function getBuildInfo(
    project: string,
    version: string,
    build: string | number
): Promise<ProjectBuildResponse | null> {
    const apiUrl = `https://fill.papermc.io/v3/projects/${project}/versions/${version}/builds`;

    try {
        if (!getCachedBuilds()) {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch data from PaperMC API');
            }

            setCachedBuilds(await response.json());
        }

        const projectBuilds = getCachedBuilds();

        if (!projectBuilds || !Array.isArray(projectBuilds)) {
            console.error('Invalid build data format:', projectBuilds);
            return null;
        }

        const buildInfo = projectBuilds.find(
            (b: Build) => b.id === Number(build)
        );

        if (!buildInfo) {
            console.error(`Build ${build} not found for project ${project}`);
            return null;
        }

        const downloadServers = Object.keys(buildInfo.downloads);
        if (downloadServers.length === 0) {
            console.warn(
                `No downloads found for build ${build} of project ${project}`
            );
            return null;
        }

        const downloadServer = downloadServers[0];

        if (!buildInfo.downloads[downloadServer]?.url) {
            console.error(
                `Download URL not found for build ${build} of project ${project}`
            );
            return null;
        }

        if (!buildInfo.downloads[downloadServer]?.checksums?.sha256) {
            console.error(
                `Checksum not found for build ${build} of project ${project}`
            );
            return null;
        }

        if (!buildInfo.downloads[downloadServer]?.name) {
            console.error(
                `File name not found for build ${build} of project ${project}`
            );
            return null;
        }

        return {
            project_id: project,
            project_name: projectNamesMap[project] || project,
            version: version,
            build: buildInfo.id,
            channel: buildInfo.channel,
            time: buildInfo.time,
            downloadUrl: buildInfo.downloads[downloadServer].url,
            fileName: buildInfo.downloads[downloadServer].name,
            checksums: buildInfo.downloads[downloadServer].checksums
        } as ProjectBuildResponse;
    } catch (error) {
        logFormatted('&cError fetching build info:', error);
        return null;
    }
}
