export default async function handler(req, res) {
  const repo = "jdsmedeiros/PeladaFia2026";
  const path = "dados.json";
  const token = process.env.GITHUB_TOKEN;

  // 🔽 GET (carregar dados)
  if (req.method === "GET") {
    const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store", // 🔥 evita cache
    });

    const data = await r.json();

    const content = data.content
      ? JSON.parse(Buffer.from(data.content, "base64").toString())
      : [];

    return res.status(200).json({
      content,
      sha: data.sha,
    });
  }

  // 🔼 POST (salvar dados)
  if (req.method === "POST") {
    const { jogadores, sha } = req.body;

    const content = Buffer.from(
      JSON.stringify(jogadores, null, 2)
    ).toString("base64");

    const update = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "Atualizando artilharia",
          content,
          sha,
        }),
      }
    );

    const result = await update.json();

    return res.status(200).json({
      ok: true,
      sha: result.content.sha, // 🔥 retorna SHA novo
    });
  }

  return res.status(405).end();
}
