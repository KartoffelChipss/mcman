export const projectNamesMap: { [key: string]: string } = {
    paper: 'Paper',
    waterfall: 'Waterfall',
    velocity: 'Velocity',
    folia: 'Folia'
};

export interface FillProjectData {
    projects: ProjectEntry[];
}

export interface ProjectEntry {
    project: {
        id: string;
    };
    versions: VersionMap;
}

export type VersionMap = {
    [majorVersion: string]: string[];
};

export interface FillProjectBuilds extends Array<Build> {}

export interface Build {
    id: number;
    time: string;
    channel: string;
    commits: Commit[];
    downloads: {
        [key: string]: Download;
    };
}

export interface Commit {
    sha: string;
    time: string;
    message: string;
}

export interface Download {
    name: string;
    checksums: {
        sha256: string;
    };
    size: number;
    url: string;
}

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
    channel: string;
    time: string;
    downloadUrl: string;
    fileName: string;
    checksums: {
        sha256: string;
    };
}
