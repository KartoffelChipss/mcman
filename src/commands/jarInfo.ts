import { formatString } from '../util/formatter';
import { getMinecraftJarInfo } from '../util/jarInfo';

export const jarInfoCommand = (jarPath: string) => {
    const info = getMinecraftJarInfo(jarPath);

    if (!info) {
        console.error(formatString('&cNo valid jar file found.'));
        return;
    }

    if (info.software === null) {
        console.error(formatString('&cUnknown server software.'));
        return;
    }

    console.log(info.software + (info.version ? ` ${info.version}` : ''));
};
