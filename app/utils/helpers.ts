export const findObjectFromArray = (array: Array<Record<string, unknown>>, key: string, value: unknown) => {
    if (!Array.isArray(array) || !key || (value === undefined || value === null)) return
    const map = new Map(array.map((item: Record<string, unknown>) => [item[key], item]))
    return map.get(value)
}

export const safeTypechecker = (input: any) => {
    return Object.prototype.toString.call(input).slice(8, -1);
}

const validType = (value: any): boolean => {
    const type = safeTypechecker(value);
    let isValid = true;
    switch(type) {
        case 'Undefined':
        case 'Null':
            {
                isValid = false;
                break;
            }
        case 'String': {
            isValid = !!value.length;
        }
    }
    return isValid;
}

export const removeNullAndUndefinedFromObject = (input: Record<string, any>) => {
    const type = safeTypechecker(input);
    if (type !== 'Object') return;
    let cleanObject = {};
    for (const [key, value] of Object.entries(input)) {

        if (validType(value)) {
            cleanObject[key] = value;
        }
    }
    return cleanObject;
}

export const checkIfMissingRequiredProperty = (input: Record<string, any>, requiredProps: Array<string>): { missing: boolean, prop?: any } | undefined => {
    const type = safeTypechecker(input);
    if (type !== 'Object') return;
    let missingRequiredProp = false;
    const missingProps: string[] = [];
    requiredProps.forEach((prop: string) => {
        const propExist = Object.keys(input).some((p: string) => p === prop);
        console.log("Checker: ", { propExist, prop: prop })
        if (!propExist) {
            missingRequiredProp = true;
            missingProps.push(prop);
        }
    });
    return { missing: missingRequiredProp, prop: missingProps };
}

export const removeObjectProps = <T extends Record<string, any>>(object: T | any, props: string[]): Partial<T> | undefined => {
    const type = safeTypechecker(object);
    if (type !== 'Object') return undefined;
    const result = { ...object } as Partial<T>;
    for (const prop of props) {
        if (typeof prop === 'string') {
            delete result[prop];
        }
    }
    return result;
}