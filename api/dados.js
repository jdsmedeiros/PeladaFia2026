export default async function handler(req, res) {
  const repo = "jdsmedeiros/PeladaFia2026";
  const path = "dados.json";
  const token = process.env.GITHUB_TOKEN;

  // =========================
  // GET
  // =========================
  if (req.method === "GET") {
    const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
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

  // =========================
  // POST (SALVAR)
  // =========================
  if (req.method === "POST") {
    try {
      let { jogadores, sha } = req.body;

      // 🔥 SEMPRE pega SHA mais recente antes de salvar
      const latest = await fetch(
        `https://api.github.com/repos/${repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      const latestData = await latest.json();
      const latestSha = latestData.sha;

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
            sha: latestSha, // 🔥 usa sempre o mais recente
          }),
        }
      );

      const text = await update.text();

      if (!update.ok) {
        return res.status(500).json({
          error: "Erro ao salvar",
          details: text,
        });
      }

      const result = JSON.parse(text);

      return res.status(200).json({
        ok: true,
        sha: result.content.sha,
      });

    } catch (err) {
      return res.status(500).json({
        error: "Erro interno",
        details: err.message,
      });
    }
  }

  return res.status(405).end();
}
