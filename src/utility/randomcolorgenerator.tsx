
function getRandomHexColor(): string {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    return `#${hex}`;
}

function getContrastingTextColor(hex: string): string {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate brightness (YIQ formula)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black for bright colors, white for dark colors
    return yiq >= 128 ? '#000000' : '#FFFFFF';
}

function getRandomBackgroundAndContrastingTextColor(): { backgroundColor: string, textColor: string } {
    let backgroundColor = getRandomHexColor().slice(1);
    let textColor = getContrastingTextColor(backgroundColor).slice(1);

    return { backgroundColor, textColor };
}


export default getRandomBackgroundAndContrastingTextColor;