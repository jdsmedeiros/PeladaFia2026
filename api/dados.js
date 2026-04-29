export default async function handler(req, res) {
  const repo = "jdsmedeiros/PeladaFia2026";
  const path = "dados.json";
  const token = process.env.GITHUB_TOKEN;

  if (req.method === "GET") {
    const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
    const data = await r.json();
    const content = JSON.parse(Buffer.from(data.content, "base64").toString());
    return res.status(200).json({ content, sha: data.sha });
  }

  if (req.method === "POST") {
    const { jogadores, sha } = req.body;

    const content = Buffer.from(JSON.stringify(jogadores, null, 2)).toString("base64");

    await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Atualizando artilharia",
        content,
        sha,
      }),
    });

    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}