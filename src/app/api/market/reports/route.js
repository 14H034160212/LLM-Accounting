import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const asxPath = path.join(process.cwd(), 'data', 'announcements_asx.json');
        const nzxPath = path.join(process.cwd(), 'data', 'announcements_nzx.json');

        let asxData = [];
        let nzxData = [];

        if (fs.existsSync(asxPath)) {
            asxData = JSON.parse(fs.readFileSync(asxPath, 'utf8'));
        }
        if (fs.existsSync(nzxPath)) {
            nzxData = JSON.parse(fs.readFileSync(nzxPath, 'utf8'));
        }

        // Combine and format for UI
        const all = [
            ...asxData.map(item => {
                const url = item.pdf_link;
                const docKey = url.split('/').pop().split('&')[0];
                return {
                    ...item,
                    exchange: 'ASX',
                    local_file: `ASX_${item.ticker}_${docKey}.pdf`
                };
            }),
            ...nzxData.map(item => {
                const url = item.pdf_link;
                const docKey = url.split('/').pop().replace('.pdf', '');
                return {
                    ...item,
                    exchange: 'NZX',
                    local_file: `NZX_${item.ticker}_${docKey}.pdf`
                };
            })
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return Response.json(all);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
