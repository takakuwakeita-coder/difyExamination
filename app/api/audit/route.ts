import { NextRequest } from "next/server";

<<<<<<< HEAD
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

    const text =
      await response.text();

    return new Response(
      text,
      {
        status: response.status,
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
        error: e.toString()
      },
      {
        status: 500
=======
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
>>>>>>> d4bb75917c584229aebcd3926c9ee3c7099d536c
      }
    );
  }
}