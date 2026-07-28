"use client";

import React, { useState } from "react";
import { Buffer } from "buffer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Summary = {
  ok: string;
  ng: string;
  review: string;
  total: string;
  target: string;
  evaluation: string;
  reason: string;
};

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

  const [summary, setSummary] =
    useState<Summary>({
      ok: "0件",
      ng: "0件",
      review: "0件",
      total: "",
      target: "",
      evaluation: "",
      reason: ""
    });

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 24px",
    background: "#4E2DA8",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    width: "160px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    marginBottom: "10px"
  };

  const fileCardStyle: React.CSSProperties = {
    background: "#f5f6fa",
    border: "1px solid #e5e7eb",
    color: "#333",
    padding: "10px 12px",
    marginTop: "8px",
    borderRadius: "6px",
    fontSize: "13px",
    lineHeight: "1.5",
    wordBreak: "break-all"
  };

  const extractSummary = (output: string) => {
    const getValue = (label: string) => {
      const regex =
        new RegExp(`${label}：([^\\n]+)`);

      const match =
        output.match(regex);

      return match
        ? match[1].trim()
        : "";
    };

    setSummary({
      ok: getValue("OK件数") || "0件",
      ng: getValue("NG件数") || "0件",
      review: getValue("REVIEW件数") || "0件",
      total: getValue("税込金額合計"),
      target: getValue("補助対象経費（税抜）合計"),
      evaluation: getValue("全体評価"),
      reason:
        output.includes("評価理由：")
          ? output
              .split("評価理由：")[1]
              ?.split("\n")[0]
              ?.trim() ?? ""
          : ""
    });
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
      setResult("");

      const evidences = [];

      for (const pdf of Array.from(pdfFiles)) {
        const bytes =
          await pdf.arrayBuffer();

        evidences.push({
          filename: pdf.name,
          content:
            Buffer
              .from(bytes)
              .toString("base64"),
          contentType: "application/pdf"
        });
      }

      const detailBytes =
        await detailFile.arrayBuffer();

      const categoryBytes =
        await categoryFile.arrayBuffer();

      const payload = {
        evidences,

        expence_detail: {
          filename: detailFile.name,
          content:
            Buffer
              .from(detailBytes)
              .toString("base64"),
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },

        expence_category_master: {
          filename: categoryFile.name,
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
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
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

        setSummary({
          ok: "0件",
          ng: "0件",
          review: "0件",
          total: "",
          target: "",
          evaluation: "ERROR",
          reason: "審査処理でエラーが発生しました。"
        });

        return;
      }

      const output =
        body.workflow_result
          ?.data
          ?.outputs
          ?.output ?? "";

      setResult(output);
      extractSummary(output);

    } catch (e: any) {
      console.error(e);

      setResult(
        e?.message || e.toString()
      );

      setSummary({
        ok: "0件",
        ng: "0件",
        review: "0件",
        total: "",
        target: "",
        evaluation: "ERROR",
        reason: e?.message || e.toString()
      });

    } finally {
      setLoading(false);
    }
  };

  const evaluationColor =
    summary.evaluation.includes("OK")
      ? "#e8f5e9"
      : summary.evaluation.includes("NG")
      ? "#ffebee"
      : summary.evaluation.includes("ERROR")
      ? "#ffebee"
      : "#fff8e1";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f5f7",
        backgroundImage:
          "url('/GARP_back.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "100% auto",
        padding: "30px"
      }}
    >
      {/* GARP Header */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto 20px auto",
          background: "#4E2DA8",
          borderRadius: "8px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.12)"
        }}
      >
        <div
          style={{
            height: "72px",
            display: "flex",
            alignItems: "center",
            padding: "0 24px"
          }}
        >
          <img
            src="/garp_logo.png"
            alt="GARP"
            style={{
              height: "46px",
              background: "#fff",
              padding: "4px 10px",
              borderRadius: "4px"
            }}
          />

          <div
            style={{
              marginLeft: "20px"
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: "26px",
                fontWeight: 700
              }}
            >
              補助金経費審査AI
            </div>

            <div
              style={{
                color: "#ddd",
                fontSize: "12px"
              }}
            >
              GARP申請審査プラットフォーム
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              color: "#ddd",
              fontSize: "13px"
            }}
          >
            AIによる証憑解析・補助金審査
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "24px"
        }}
      >
        {/* Left Card */}
        <div
          style={{
            width: "100%",
            padding: "20px",
            background: "#ffffff",
            color: "#333",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            boxShadow:
              "0 6px 16px rgba(0,0,0,0.08)"
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              marginBottom: "10px"
            }}
          >
            📁 ファイル選択
          </h2>

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
                setPdfFiles(e.target.files)
              }
            />
          </label>

          <div>
            {pdfFiles ? (
              Array.from(pdfFiles).map(
                (x, i) => (
                  <div
                    key={i}
                    style={fileCardStyle}
                  >
                    📄 {x.name}
                  </div>
                )
              )
            ) : (
              <div
                style={{
                  color: "#888",
                  fontSize: "13px"
                }}
              >
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
                  e.target.files?.[0] ?? null
                )
              }
            />
          </label>

          <div style={{ marginTop: "10px" }}>
            {detailFile ? (
              <div style={fileCardStyle}>
                📊 {detailFile.name}
              </div>
            ) : (
              <div
                style={{
                  color: "#888",
                  fontSize: "13px"
                }}
              >
                選択されていません
              </div>
            )}
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
                  e.target.files?.[0] ?? null
                )
              }
            />
          </label>

          <div style={{ marginTop: "10px" }}>
            {categoryFile ? (
              <div style={fileCardStyle}>
                📊 {categoryFile.name}
              </div>
            ) : (
              <div
                style={{
                  color: "#888",
                  fontSize: "13px"
                }}
              >
                選択されていません
              </div>
            )}
          </div>

          <br />

          <button
            onClick={runAudit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#8f7ad1"
                : "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              boxShadow:
                "0 4px 12px rgba(255,152,0,0.35)"
            }}
          >
            {loading
              ? "🤖 AI審査中..."
              : "🚀 AI審査開始"}
          </button>
        </div>

        {/* Right Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "6px",
            border: "1px solid #d9d9d9",
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

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 1fr",
              gap: "12px",
              marginBottom: "20px"
            }}
          >
            <div
              style={{
                background: "#e8f5e9",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <div>✅ OK</div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700
                }}
              >
                {summary.ok}
              </div>
            </div>

            <div
              style={{
                background: "#ffebee",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <div>❌ NG</div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700
                }}
              >
                {summary.ng}
              </div>
            </div>

            <div
              style={{
                background: "#fff8e1",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <div>⚠ REVIEW</div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700
                }}
              >
                {summary.review}
              </div>
            </div>
          </div>

          {/* Amount Info */}
          <div
            style={{
              background: "#f5f6fa",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px"
            }}
          >
            <div>
              <strong>
                税込金額合計：
              </strong>
              {summary.total || "-"}
            </div>

            <div
              style={{
                marginTop: "10px"
              }}
            >
              <strong>
                補助対象経費（税抜）合計：
              </strong>
              {summary.target || "-"}
            </div>
          </div>

          {/* Overall Evaluation */}
          <div
            style={{
              background: evaluationColor,
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "10px"
              }}
            >
              総合評価：
              {summary.evaluation || "-"}
            </div>

            <div
              style={{
                lineHeight: "1.8"
              }}
            >
              {summary.reason || "審査実行後に結果が表示されます。"}
            </div>
          </div>

          {/* Detail Markdown */}
          {result && (
            <details>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                  color: "#4E2DA8"
                }}
              >
                詳細結果を表示
              </summary>

              <div
                style={{
                  marginTop: "16px",
                  lineHeight: "1.9",
                  fontSize: "15px",
                  overflowX: "auto"
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          marginTop: "20px"
                        }}
                      >
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th
                        style={{
                          border: "1px solid #ddd",
                          background: "#f5f5f7",
                          padding: "8px"
                        }}
                      >
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          verticalAlign: "top"
                        }}
                      >
                        {children}
                      </td>
                    )
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </details>
          )}
        </div>
      </div>
    </main>
  );
}