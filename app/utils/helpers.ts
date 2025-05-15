export const findObjectFromArray = (array: Array<Record<string, unknown>>, key: string, value: unknown) => {
    if (!Array.isArray(array) || !key || (value === undefined || value === null)) return
    const map = new Map(array.map((item: Record<string, unknown>) => [item[key], item]))
    return map.get(value)
}