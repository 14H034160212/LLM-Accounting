import { execSync } from "child_process";
import path from "path";

export async function GET() {
    try {
        const scriptPath = path.join(process.cwd(), "scripts", "audit_categorizer.py");
        const output = execSync(`python3 "${scriptPath}"`, { encoding: 'utf8' });
        const analysis = JSON.parse(output);

        return Response.json(analysis);
    } catch (err) {
        console.error("Audit API Error:", err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
