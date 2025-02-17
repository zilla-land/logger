export function sanitized(str: string): string {

    return str.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, 
        ""
    )

}

export function maxLength(strs: string[]): number {

    const lengths = strs
        .map(s => sanitized(s).length)

    return Math
        .max(...lengths)

}

export function minLengthOrApplyTrailingPad(str: string, length: number): string {

    const sanitizedStr = sanitized(str)

    if (sanitizedStr.length >= length) {
        return str
    }

    const diff = (length - sanitizedStr.length)

    let result = str

    for (let i = 0; i < diff; i++) {
        result += " "
    }

    return result

}
