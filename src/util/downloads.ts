import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export async function downloadFile(
    url: string,
    destination: string,
    fileName: string
): Promise<void> {
    try {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        const fullDestination = path.resolve(destination, fileName);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is null');
        }

        const nodeStream = new Readable({
            async read() {
                const { done, value } = await reader.read();
                if (done) {
                    this.push(null);
                } else {
                    this.push(Buffer.from(value));
                }
            }
        });

        await pipeline(nodeStream, fs.createWriteStream(fullDestination));

        console.log(`File downloaded to ${fullDestination}`);
    } catch (error) {
        console.error(`Error downloading file: ${(error as Error).message}`);
        throw error;
    }
}
