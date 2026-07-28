
//hhhh
"use client";

import { useState } from "react";
import { Buffer } from "buffer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  padding: "12px 24px",
  backgroundImage:
  "url('/garp_back.png')",
backgroundPosition:
  "bottom center",
backgroundRepeat:
  "no-repeat",
backgroundSize:
  "contain",
backgroundColor:
  "#eef2f7",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
  marginBottom: "10px",
  boxShadow:
    "0 4px 20px rgba(0,120,212,0.25)"
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
      minHeight: "100vh",
      background:
        "linear-gradient(135deg,#4c2ca3,#6f42c1)",
      padding: "40px"
    }}
  >
    {/* ヘッダーカード */}

<div
  style={{
    maxWidth: "1400px",
    margin: "0 auto 30px auto",
    background:
      "rgba(255,255,255,0.95)",
    backdropFilter:
      "blur(10px)",
    borderRadius: "24px",
    padding: "24px 32px",
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.08)"
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "24px"
    }}
  >
    <img
      src="/garp_logo.png"
      alt="GARP"
      style={{
        height: "90px",
        objectFit: "contain"
      }}
    />

    <div>
      <h1
        style={{
          margin: 0,
          fontSize: "38px",
          color: "#4c2ca3",
          fontWeight: 700
        }}
      >
        補助金経費審査AI
      </h1>

      <div
        style={{
          marginTop: "8px",
          color: "#666",
          fontSize: "15px"
        }}
      >
        GARP申請審査プラットフォーム
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#888",
          fontSize: "13px"
        }}
      >
        AIによる証憑解析・経費審査・補助金適合性チェック
      </div>
    </div>
  </div>
</div>


    {/* メインエリア */}
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns:
          "380px 1fr",
        gap: "24px"
      }}
    >
      {/* 左カラム */}
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "24px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >
        <h2>📁 ファイル選択</h2>

        <hr />

        <h3>証憑PDF</h3>

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
          {pdfFiles ? (
            Array.from(pdfFiles).map(
              (x, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      "#eef5ff",
                    padding: "8px",
                    marginTop: "5px",
                    borderRadius:
                      "8px",
                    fontSize:
                      "13px"
                  }}
                >
                  📄 {x.name}
                </div>
              )
            )
          ) : (
            <div>
              選択されていません
            </div>
          )}
        </div>

        <br />

        <h3>経費明細</h3>

        <label style={buttonStyle}>
          Excelを選択

          <input
            type="file"
            accept=".xlsx"
            hidden
            onChange={(e) =>
              setDetailFile(
                e.target.files?.[0] ??
                  null
              )
            }
          />
        </label>

        <div>
          {detailFile?.name ||
            "選択されていません"}
        </div>

        <br />

        <h3>経費区分マスタ</h3>

        <label style={buttonStyle}>
          Excelを選択

          <input
            type="file"
            accept=".xlsx"
            hidden
            onChange={(e) =>
              setCategoryFile(
                e.target.files?.[0] ??
                  null
              )
            }
          />
        </label>

        <div>
          {categoryFile?.name ||
            "選択されていません"}
        </div>

        <br />

        <button
          onClick={runAudit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background:
              "linear-gradient(135deg,#00c853,#009624)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow:
              "0 4px 20px rgba(0,180,0,0.4)"
          }}
        >
          {loading
            ? "🤖 AI審査中..."
            : "🚀 AI審査開始"}
        </button>
      </div>

      {/* 右カラム */}
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          borderRadius: "20px",
          padding: "30px",
          minHeight: "900px",
          width: "100%",
          overflowY: "auto",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)"
        }}
      >
        <h2>📊 審査結果</h2>

        <hr />

        <div
          style={{
            lineHeight: "1.9",
            fontSize: "15px"
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          >
            {result}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  </main>
);
}