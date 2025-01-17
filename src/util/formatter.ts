type ColorMap = { [key: string]: string };

export function formatString(input: string): string {
    const colorMap: ColorMap = {
        '0': '\u001b[30m', // Black
        '1': '\u001b[34m', // Dark Blue
        '2': '\u001b[32m', // Dark Green
        '3': '\u001b[36m', // Dark Aqua
        '4': '\u001b[31m', // Dark Red
        '5': '\u001b[35m', // Dark Purple
        '6': '\u001b[33m', // Gold
        '7': '\u001b[37m', // Gray
        '8': '\u001b[90m', // Dark Gray
        '9': '\u001b[94m', // Blue
        a: '\u001b[92m', // Green
        b: '\u001b[96m', // Aqua
        c: '\u001b[91m', // Red
        d: '\u001b[95m', // Light Purple
        e: '\u001b[93m', // Yellow
        f: '\u001b[97m', // White
        r: '\u001b[0m', // Reset
        l: '\u001b[1m', // Bold
        m: '\u001b[9m', // Strikethrough
        n: '\u001b[4m', // Underline
        o: '\u001b[3m' // Italic
    };

    return (
        input.replace(/&([0-9a-frlmno])/g, (_, code) => colorMap[code] || '') +
        '\u001b[0m'
    );
}

export function removeFormatting(input: string): string {
    return input.replace(/&[0-9a-frlmno]/g, '');
}

export function logFormatted(...args: any[]): void {
    const formattedArgs = args.map((arg) =>
        typeof arg === 'string' ? formatString(arg) : arg
    );
    console.log(...formattedArgs);
}

export function spaceBetween(
    left: string,
    right: string,
    spaceChar?: string | null
): string {
    const terminalWidth = process.stdout.columns || 80;
    const leftLength = removeFormatting(left).length;
    const rightLength = removeFormatting(right).length;

    const spacesNeeded = terminalWidth - (leftLength + rightLength);
    spaceChar = spaceChar || ' ';
    const spaces =
        spacesNeeded > 0 ? spaceChar.repeat(spacesNeeded) : spaceChar;

    return `${left}${spaces}${right}`;
}

export function logSpaceBetween(
    left: string,
    right: string,
    spaceChar?: string | null
): void {
    logFormatted(spaceBetween(left, right, spaceChar));
}

export function center(text: string, spaceChar?: string | null): string {
    const terminalWidth = process.stdout.columns || 80;
    const textLength = removeFormatting(text).length;

    const spacesNeeded = terminalWidth - textLength;
    spaceChar = spaceChar || ' ';
    const spaces =
        spacesNeeded > 0 ? spaceChar.repeat(spacesNeeded / 2) : spaceChar;

    return `${spaces}${text}${spaces}`;
}

export function logCenter(text: string, spaceChar?: string | null): void {
    logFormatted(center(text, spaceChar));
}

export function logTable(
    rows: string[][],
    options?: {
        spaceChar?: string | null;
        gapBetweenColumns?: number;
        headerSeparator?: boolean;
        firstColumnLine?: boolean;
        lineFormat?: string;
    }
): void {
    const gapBetweenColumns = options?.gapBetweenColumns || 3;
    const spaceChar = options?.spaceChar || ' ';
    const headerSeparator = options?.headerSeparator || false;
    const firstColumnLine = options?.firstColumnLine || false;
    const lineFormat = options?.lineFormat || '';

    const longestInColumn = [];
    for (const row of rows) {
        for (let i = 0; i < row.length; i++) {
            if (
                !longestInColumn[i] ||
                removeFormatting(row[i]).length > longestInColumn[i]
            ) {
                longestInColumn[i] = removeFormatting(row[i]).length;
            }
        }
    }

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        let formattedRow = '';

        for (let i = 0; i < row.length; i++) {
            const column = row[i] + '&r';
            const padding = spaceChar.repeat(
                longestInColumn[i] - removeFormatting(column).length
            );
            formattedRow += `${column}${padding}`;

            if (i < row.length - 1) {
                if (i === 0 && firstColumnLine) {
                    formattedRow += formatString(` ${lineFormat}| &r`);
                } else {
                    formattedRow += spaceChar.repeat(gapBetweenColumns);
                }
            }
        }

        logFormatted(formattedRow);

        const lineChar = lineFormat ? formatString(lineFormat + '-') : '-';
        if (rowIndex === 0 && headerSeparator) {
            let separatorRow = '';
            for (let i = 0; i < row.length; i++) {
                separatorRow += lineChar.repeat(longestInColumn[i]);
                if (i < row.length - 1) {
                    if (i === 0 && firstColumnLine) {
                        separatorRow += `${lineChar}${lineFormat ? formatString(`${lineFormat}+`) : '+'}`;
                    } else {
                        separatorRow += lineChar.repeat(gapBetweenColumns);
                    }
                }
            }

            const formattedSeparatorRow = lineFormat
                ? formatString(lineFormat + separatorRow + '&r')
                : separatorRow;

            logFormatted(formattedSeparatorRow);
        }
    }
}
