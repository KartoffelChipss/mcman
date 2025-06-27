import { FillProjectBuilds, FillProjectData } from './paperTypes';

let cachedProjectData: FillProjectData | null = null;
let cachedBuilds: FillProjectBuilds | null = null;

export function getCachedProjectData() {
    return cachedProjectData;
}

export function setCachedProjectData(data: FillProjectData) {
    cachedProjectData = data;
}

export function getCachedBuilds() {
    return cachedBuilds;
}

export function setCachedBuilds(data: FillProjectBuilds) {
    cachedBuilds = data;
}
