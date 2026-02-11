import xss from "xss";

const sanitizeMongo = (value) => {
    if (typeof value === 'string') {
        return value.replace(/[$]/g, '');
    }
    if (value && typeof value === 'object') {
        for (const key of Object.keys(value)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete value[key];
            } else {
                value[key] = sanitizeMongo(value[key]);
            }
        }
    }
    return value;
};

const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return xss(input.trim());
    }
    return sanitizeMongo(input);
};

export { sanitizeMongo, sanitizeInput };
