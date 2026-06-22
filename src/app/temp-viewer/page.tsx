import fs from "fs";
import path from "path";

interface PageProps {
  searchParams: { page?: string };
}

export default function TempViewerPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10;

  const targetDir = path.join(process.cwd(), "Finished Plates");
  const allFiles = fs.readdirSync(targetDir)
    .filter(f => f.startsWith("ChatGPT Image") && fs.statSync(path.join(targetDir, f)).isFile())
    .sort();

  const totalPages = Math.ceil(allFiles.length / pageSize);
  const files = allFiles.slice((page - 1) * pageSize, page * pageSize);

  const fileData = files.map(file => {
    const filePath = path.join(targetDir, file);
    const data = fs.readFileSync(filePath).toString("base64");
    return {
      name: file,
      src: `data:image/png;base64,${data}`
    };
  });

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "20px", fontSize: "28px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        Botanical Plates Viewer — Page {page} of {totalPages} ({allFiles.length} total raw plates)
      </h1>
      
      {/* Pagination */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <a
            key={i}
            href={`/temp-viewer?page=${i + 1}`}
            style={{
              padding: "8px 16px",
              background: page === i + 1 ? "#10b981" : "#222",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "14px",
              border: "1px solid #444"
            }}
          >
            Page {i + 1}
          </a>
        ))}
      </div>

      {/* Plates List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "50px" }}>
        {fileData.map(file => (
          <div
            key={file.name}
            style={{
              background: "#121212",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <h2 style={{ alignSelf: "flex-start", margin: "0 0 15px 0", color: "#10b981", fontSize: "16px", fontFamily: "monospace" }}>
              Filename: {file.name}
            </h2>
            <div style={{ width: "100%", maxWidth: "700px", background: "#1a1a1a", padding: "10px", borderRadius: "8px" }}>
              <img
                src={file.src}
                alt={file.name}
                style={{ width: "100%", height: "auto", display: "block", borderRadius: "4px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
