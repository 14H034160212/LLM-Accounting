import fs from 'fs';
import path from 'path';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
        return Response.json({ error: "No filename provided" }, { status: 400 });
    }

    // Security: Prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), 'data', 'reports', safeFilename);

    if (!fs.existsSync(filePath)) {
        return Response.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${safeFilename}"`,
        },
    });
}
