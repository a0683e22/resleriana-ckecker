// 🛠️ 壓縮：將數字陣列轉換為極短的 Base64 字串
export function compressIds(ids) {
    if (!ids || ids.length === 0) return "";

    const maxId = Math.max(...ids);
    const numBytes = Math.ceil((maxId + 1) / 8);
    const bytes = new Uint8Array(numBytes);

    for (const id of ids) {
        bytes[Math.floor(id / 8)] |= (1 << (id % 8));
    }

    let binaryStr = "";
    for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
    }

    return btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 🛠️ 解壓縮：將 Base64 字串還原為數字陣列
export function decompressIds(base64Str) {
    if (!base64Str) return [];

    let str = base64Str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4 !== 0) str += '=';

    const binaryStr = atob(str);
    const ids = [];

    for (let byteIndex = 0; byteIndex < binaryStr.length; byteIndex++) {
        const byte = binaryStr.charCodeAt(byteIndex);
        for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
            if (byte & (1 << bitIndex)) {
                ids.push(byteIndex * 8 + bitIndex);
            }
        }
    }
    return ids;
}


export function compressMemoria(memoriaOwned, memoriaData) {
    if (!memoriaOwned) return "";

    const raw = Object.keys(memoriaData)
        .sort((a, b) => a - b)
        .map(id => Math.max(0, Math.min(5, memoriaOwned[id] || 0)))
        .join('');

    return btoa(raw)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function decompressMemoria(encoded, memoriaData) {
    if (!encoded) return {};

    // 還原 URL 安全字元並補足 Base64 Padding
    let str = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4 !== 0) str += '=';

    const decoded = atob(str);
    const ids = Object.keys(memoriaData)
        .map(Number)
        .sort((a, b) => a - b);

    const result = {};
    ids.forEach((id, index) => {
        result[id] = Number(decoded[index] || 0);
    });

    return result;
}