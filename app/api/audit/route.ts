import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest
) {
  try {
    const payload =
      await req.json();

    const response =
      await fetch(
        "https://difyexamination202607-d9bxa7ewgmffagce.eastus2-01.azurewebsites.net/api/dify-upload",
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

    const text =
      await response.text();

    return new Response(
      text,
      {
        status:
          response.status,
        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );
  } catch (e: any) {
    return Response.json(
      {
        success: false,
        error:
          e.toString()
      },
      {
        status: 500
      }
    );
  }
}