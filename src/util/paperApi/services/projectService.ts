import { getCachedProjectData, setCachedProjectData } from '../cache';
import { ProjectEntry } from '../paperTypes';

export async function getProjectList(): Promise<string[] | null> {
    const apiUrl = 'https://fill.papermc.io/v3/projects';

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

        const projects: string[] = projectData.projects.map(
            (entry: ProjectEntry) => entry.project.id
        );

        return projects;
    } catch (error) {
        console.error('Error fetching project list:', error);
        return null;
    }
}
