import QRCode from 'qrcode';

export const generateQRCode = async (url: string): Promise<string> => {
    return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
            dark: '#6366f1',
            light: '#ffffff'
        }
    });
};