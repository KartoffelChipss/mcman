import { getCachedProjectData, setCachedProjectData } from '../cache';
import {
    ProjectEntry,
    projectNamesMap,
    VersionMap,
    VersionResponse
} from '../paperTypes';

export async function getVersions(
    project: string
): Promise<VersionResponse | null> {
    const apiUrl = `https://fill.papermc.io/v3/projects`;

    try {
        if (!getCachedProjectData()) {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error('Failed to fetch data from PaperMC API');
            }

            setCachedProjectData(await response.json());
        }

        const projectData = getCachedProjectData();

        if (!projectData || !projectData.projects) {
            console.error('Invalid project data format:', projectData);
            return null;
        }

        const projectEntry = projectData.projects.find(
            (entry: ProjectEntry) => entry.project.id === project
        );

        if (!projectEntry) {
            console.error(`Project ${project} not found`);
            return null;
        }

        const versions: VersionMap = projectEntry.versions;
        const versionGroups = Object.keys(versions);
        const versionList: string[] = [];

        for (const group of versionGroups) {
            versionList.push(...versions[group]);
        }

        versionList.reverse();

        const data: VersionResponse = {
            project_id: projectEntry.project.id,
            project_name:
                projectNamesMap[projectEntry.project.id] ||
                projectEntry.project.id,
            version_groups: versionGroups,
            versions: versionList
        };

        return data;
    } catch (error) {
        console.error('Error fetching major versions:', error);
        return null;
    }
}
