export function gradient(deg: number, color1: string, color2: string) {
    return `linear-gradient(${deg.toFixed(1)}deg, ${color1}, ${color2})`;
}
