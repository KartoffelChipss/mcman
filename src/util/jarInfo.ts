import AdmZip from 'adm-zip';
import fs from 'fs';

const PROXY_SOFTWARE = ['waterfall', 'velocity'];

interface MinecraftJarInfo {
    version: string | null;
    software:
        | 'Vanilla'
        | 'Spigot'
        | 'Paper'
        | 'Velocity'
        | 'Forge'
        | 'Fabric'
        | 'Waterfall'
        | null;
    fileNames: string[];
}

/**
 * Check if the given software is a proxy server.
 * @param software The name of the software to check.
 * @returns True if the software is a proxy server, false otherwise
 */
export function isMinecraftProxy(software: string): boolean {
    return PROXY_SOFTWARE.includes(software.toLowerCase());
}

/**
 * Get information about a Minecraft server jar file.
 * @param jarPath Path to the jar file
 * @returns An object containing the version, software type, and file names, or null if the jar file does not exist or cannot be read.
 */
export function getMinecraftJarInfo(jarPath: string): MinecraftJarInfo | null {
    if (!fs.existsSync(jarPath)) return null;

    try {
        const zip = new AdmZip(jarPath);
        const entries = zip.getEntries();

        const result: MinecraftJarInfo = {
            version: null,
            software: null,
            fileNames: []
        };

        // Look for MANIFEST.MF
        try {
            const manifestEntry = zip.getEntry('META-INF/MANIFEST.MF');
            if (manifestEntry) {
                const manifest = manifestEntry.getData().toString('utf8');

                if (manifest.includes('io.papermc')) result.software = 'Paper';
                else if (manifest.includes('com.velocitypowered'))
                    result.software = 'Velocity';
                else if (manifest.includes('Waterfall'))
                    result.software = 'Waterfall';
                else if (manifest.includes('org.bukkit.craftbukkit'))
                    result.software = 'Spigot';
                else if (manifest.includes('net.minecraftforge'))
                    result.software = 'Forge';
                else if (manifest.includes('net.fabricmc'))
                    result.software = 'Fabric';
                else if (manifest.includes('net.minecraft'))
                    result.software = 'Vanilla';
            }
        } catch (err) {
            console.warn('Could not read MANIFEST.MF:', err);
        }

        const filenames = entries.map((e: any) => e.entryName);
        result.fileNames = filenames;

        // Try to find version.json or version.txt
        const versionEntry = entries.find(
            (e: any) =>
                e.entryName.endsWith('version.json') ||
                e.entryName.endsWith('version.txt')
        );

        if (versionEntry) {
            const content = versionEntry.getData().toString('utf8');
            try {
                const parsed = JSON.parse(content);
                if (result.software === 'Forge')
                    result.version = parsed.inheritsFrom || null;
                else
                    result.version =
                        parsed.name || parsed.id || parsed.version || null;
            } catch {
                result.version = content.trim();
            }
        }

        return result;
    } catch (err) {
        return null;
    }
}
