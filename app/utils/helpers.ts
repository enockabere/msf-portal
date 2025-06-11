export const findObjectFromArray = (array: Array<Record<string, unknown>>, key: string, value: unknown) => {
    if (!Array.isArray(array) || !key || (value === undefined || value === null)) return
    const map = new Map(array.map((item: Record<string, unknown>) => [item[key], item]))
    return map.get(value)
}

export const safeTypechecker = (input: any): string => {
    return Object.prototype.toString.call(input).slice(8, -1);
}

const validType = (value: any): boolean => {
    const type = safeTypechecker(value);
    let isValid: boolean;

    switch (type) {
        case 'Undefined':
        case 'Null':
            isValid = false;
            break;

        case 'String':
            isValid = value.trim().length > 0;
            break;

        default:
            isValid = true;
    }

    return isValid;
}

export const removeNullAndUndefinedFromObject = (input: Record<string, any>) => {
    const type = safeTypechecker(input);
    if (type !== 'Object') return;
    const cleanObject = {};
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

export const pickKeys = <T extends Record<string, any>>(obj: T | any, props: string[]): Record<string, any> | undefined => {
    const result = {} as Record<string, any>;
    for (const prop of props) {
        if (prop in obj) {
            result[prop] = obj[prop];
        }
    }
    return result;
}

export const decodeValue = (value: string) => {
    if (!value) return value;

    return value.replace(/_x([0-9A-Fa-f]{4})_/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );
}

export const constructDimension = (schema: Record<string, any>, schemaKey: string = 'globalDimensionNo', prefix: string = 'shortcutDimension', suffix: string = 'Code') => {
    if (safeTypechecker(schema) === 'Object') {
        return `${prefix}${schema[schemaKey]}${suffix}`
    }
};

export const employeeName = (employee: Record<string, unknown>) => {
    const names = [employee.firstName, employee.middleName, employee.lastName]
    return names.join(' ')
};

export const { format: formatNumber } = Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

export const formatCurrency = (value: number, currency = 'KES', locale = 'en-US') => {
    if (['EURO PAY', 'EURO'].includes(currency)) {
        currency = 'EUR'
    }

    const { format } = Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || 'KES',
        maximumFractionDigits: 2,
    })
    return format(value)
}

export const suggestImprestType = (assumedCode: string, dynamicValue: string): string | undefined => {
  let suggestedType: string;
  if (dynamicValue) {
    if (dynamicValue.toLowerCase().split(' ').join("").includes(assumedCode.toLowerCase())) {
      suggestedType = assumedCode;
    };
  }
  return suggestedType;
}