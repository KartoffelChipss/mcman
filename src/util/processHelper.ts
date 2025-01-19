export const isProcessRunning = (pid: number|null): boolean => {
    try {
        if (!pid) return false;
        // Sending signal 0 does not terminate the process but checks if it exists
        process.kill(pid, 0);
        return true;
    } catch (error: any) {
        return error.code === 'EPERM' || error.code === 'ESRCH' ? false : true;
    }
};