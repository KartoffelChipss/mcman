import AdmZip from 'adm-zip';
import fs from 'fs';

interface MinecraftJarInfo {
    version: string | null;
    software:
        | 'Vanilla'
        | 'Spigot'
        | 'Paper'
        | 'Velocity'
        | 'Forge'
        | 'Fabric'
        | null;
    fileNames: string[];
}

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
                else if (manifest.includes('Spigot'))
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
