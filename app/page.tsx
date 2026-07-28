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
        alert("経費区分を選択してください");
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

      const response =
        await fetch(
          process.env
            .NEXT_PUBLIC_AZURE_FUNCTION_URL!,
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

      setResult(
        body.workflow_result
            .data
            .outputs
            .output
      );

    } catch (e: any) {

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
        padding: 30
      }}
    >

      <h1>
        補助金経費審査AI
      </h1>

      <br />

      <h3>
        証憑PDF
      </h3>

      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={e =>
          setPdfFiles(
            e.target.files
          )
        }
      />

      <br />
      <br />

      <h3>
        経費明細
      </h3>

      <input
        type="file"
        accept=".xlsx"
        onChange={e =>
          setDetailFile(
            e.target.files?.[0] || null
          )
        }
      />

      <br />
      <br />

      <h3>
        経費区分マスタ
      </h3>

      <input
        type="file"
        accept=".xlsx"
        onChange={e =>
          setCategoryFile(
            e.target.files?.[0] || null
          )
        }
      />

      <br />
      <br />

      <button
        onClick={runAudit}
        disabled={loading}
      >
        {loading
          ? "審査中..."
          : "AI審査開始"}
      </button>

      <br />
      <br />

      <textarea
        value={result}
        readOnly
        rows={40}
        style={{
          width: "100%"
        }}
      />

    </main>
  );
}