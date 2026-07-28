
//hhhh
"use client";

import { useState } from "react";
import { Buffer } from "buffer";

export default function Home() {

  const [pdfFiles, setPdfFiles] =
    useState<FileList | null>(null);

  const [detailFile, setDetailFile] =
    useState<File | null>(null);

  const [categoryFile, setCategoryFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState("");

  const buttonStyle = {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#0078d4",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px"
  };

  const runAudit = async () => {

    try {

      if (!pdfFiles?.length) {
        alert("PDFを選択してください");
        return;
      }

      if (!detailFile) {
        alert("経費明細を選択してください");
        return;
      }

      if (!categoryFile) {
        alert("経費区分マスタを選択してください");
        return;
      }

      setLoading(true);

      const evidences = [];

      for (const pdf of Array.from(pdfFiles)) {

        const bytes =
          await pdf.arrayBuffer();

        evidences.push({
          filename: pdf.name,
          content:
            Buffer.from(bytes)
              .toString("base64"),
          contentType:
            "application/pdf"
        });
      }

      const detailBytes =
        await detailFile.arrayBuffer();

      const categoryBytes =
        await categoryFile.arrayBuffer();

      const payload = {

        evidences,

        expence_detail: {

          filename:
            detailFile.name,

          content:
            Buffer
              .from(detailBytes)
              .toString("base64"),

          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },

        expence_category_master: {

          filename:
            categoryFile.name,

          content:
            Buffer
              .from(categoryBytes)
              .toString("base64"),

          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      };

      console.log(
        "Function URL =",
        process.env
          .NEXT_PUBLIC_AZURE_FUNCTION_URL
      );

      const response =
        await fetch(
          "/api/audit",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body:
              JSON.stringify(payload)
          }
        );

      const body =
  await response.json();

if (!body.success) {

  setResult(
    JSON.stringify(
      body,
      null,
      2
    )
  );

  return;
}

const body =
  await response.json();

if (!body.success) {

  setResult(
    JSON.stringify(
      body,
      null,
      2
    )
  );

  return;
}

setResult(
  body.workflow_result
      ?.data
      ?.outputs
      ?.output
      ?? "結果なし"
);

    } catch (e: any) {

      console.error(e);

      setResult(
        e.toString()
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <main
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}
    >

      <h1>
        補助金経費審査AI
      </h1>


      <hr />

      <h3>
        証憑PDF
      </h3>

      <label style={buttonStyle}>
        PDFを選択

        <input
          type="file"
          accept=".pdf"
          multiple
          hidden
          onChange={(e) =>
            setPdfFiles(
              e.target.files
            )
          }
        />
      </label>

      <div>
        {
          pdfFiles
            ? Array.from(pdfFiles)
                .map(x => x.name)
                .join(", ")
            : "選択されていません"
        }
      </div>

      <br />

      <h3>
        経費明細
      </h3>

      <label style={buttonStyle}>
        Excelを選択

        <input
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) =>
            setDetailFile(
              e.target.files?.[0]
                || null
            )
          }
        />
      </label>

      <div>
        {
          detailFile
            ? detailFile.name
            : "選択されていません"
        }
      </div>

      <br />

      <h3>
        経費区分マスタ
      </h3>

      <label style={buttonStyle}>
        Excelを選択

        <input
          type="file"
          accept=".xlsx"
          hidden
          onChange={(e) =>
            setCategoryFile(
              e.target.files?.[0]
                || null
            )
          }
        />
      </label>

      <div>
        {
          categoryFile
            ? categoryFile.name
            : "選択されていません"
        }
      </div>

      <br />
      <br />

      <button
        onClick={runAudit}
        disabled={loading}
        style={{
          padding: "12px 24px",
          backgroundColor:
            "#107c10",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        {
          loading
            ? "AI審査中..."
            : "AI審査開始"
        }
      </button>

      <br />
      <br />

      <textarea
        value={result}
        readOnly
        rows={30}
        style={{
          width: "100%",
          padding: "10px",
          fontFamily:
            "Consolas, monospace"
        }}
      />
    </main>
  );
}