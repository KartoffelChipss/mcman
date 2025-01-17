import { logFormatted } from './formatter';

export interface VersionResponse {
    project_id: string;
    project_name: string;
    version_groups: string[];
    versions: string[];
}

export interface BuildsResponse {
    project_id: string;
    project_name: string;
    version: string;
    builds: number[];
}

export interface ProjectBuildResponse {
    project_id: string;
    project_name: string;
    version: string;
    build: number;
    time: string;
    channel: string;
    promoted: boolean;
    changes: Change[];
    downloads: Downloads;
}

interface Change {
    commit: string;
    summary: string;
    message: string;
}

interface Downloads {
    application: Application;
}

interface Application {
    name: string;
    sha256: string;
}

export async function getVersions(): Promise<VersionResponse | null> {
    const apiUrl = 'https://api.papermc.io/v2/projects/paper';

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console;
            throw new Error('Failed to fetch data from PaperMC API');
        }

        const data: VersionResponse = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching major versions:', error);
        return null;
    }
}

export async function getBuilds(
    version: string
): Promise<BuildsResponse | null> {
    const apiUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch data from PaperMC API');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        logFormatted('&cError fetching builds:', error);
        return null;
    }
}

export async function getBuildInfo(
    version: string,
    build: string | number
): Promise<ProjectBuildResponse | null> {
    const apiUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${build}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch data from PaperMC API');
        }

        const data = await response.json();

        return data;
    } catch (error) {
        logFormatted('&cError fetching build info:', error);
        return null;
    }
}
