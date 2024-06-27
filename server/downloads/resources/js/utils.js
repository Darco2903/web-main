/**
 * @typedef {Object} DL
 * @property {string} id
 * @property {string} name
 * @property {number} size
 * @property {string} path
 * @property {number} level
 * @property {string} created_at
 * @property {string} updated_at
 */

export function parseSize(size) {
    const units = ["o", "Ko", "Mo", "Go", "To"];
    let unit = 0;
    while (size >= 1024) {
        size /= 1024;
        unit++;
    }
    return size.toFixed(2) + units[unit];
}

export function parseDate(date) {
    return new Date(date).toLocaleString();
}

export function createDLURL(id) {
    return `${window.location.origin}/download/${id}`;
}

export function startDL(id, name) {
    const url = createDLURL(id);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
}
