import os from 'os';

export const getBaseUrl = (): string => {
    if (process.env.PUBLIC_URL) {
        return process.env.PUBLIC_URL.replace(/\/$/, '');
    }

    const envUrl = process.env.FRONTEND_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/$/, '');
    }

    const interfaces = os.networkInterfaces();
    let detectedIp = '';

    for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name];
        if (!ifaceList) continue;

        for (const iface of ifaceList) {
            if (iface.internal || iface.family !== 'IPv4') continue;

            if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                return `http://${iface.address}:5173`;
            }
            detectedIp = iface.address;
        }
    }

    return detectedIp
        ? `http://${detectedIp}:5173`
        : envUrl || 'http://localhost:5173';
};

export const generateJoinUrl = (code: string): string => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/join/${code}`;
};