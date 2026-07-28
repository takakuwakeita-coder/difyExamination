import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const functionUrl = process.env.DIFY_FUNCTION_URL;

    if (!functionUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DIFY_FUNCTION_URL is not configured."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}