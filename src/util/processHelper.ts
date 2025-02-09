import { exec } from "child_process";

export const isProcessRunning = (pid: number|null): boolean => {
    try {
        if (!pid) return false;
        // Sending signal 0 does not terminate the process but checks if it exists
        process.kill(pid, 0);
        return true;
    } catch (error: any) {
        return !error.code || error.code === 'EPERM' || error.code === 'ESRCH' ? false : true;
    }
};

export const openInDefaultApp = (path: string): Promise<void> => {
    const openCommand =
        process.platform === 'win32'
            ? 'start'
            : process.platform === 'darwin'
              ? 'open'
              : 'xdg-open';

    return new Promise((resolve, reject) => {
        exec(`${openCommand} "${path}"`, (err) => {
            if (err) {
                reject(
                    new Error(
                        `Failed to open in the default editor: ${err.message}`
                    )
                );
            } else {
                resolve();
            }
        });
    });
};