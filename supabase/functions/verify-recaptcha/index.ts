declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RecaptchaVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("RECAPTCHA_SECRET_KEY");

    if (!secret) {
      return Response.json(
        { success: false, error: "Missing RECAPTCHA_SECRET_KEY" },
        { status: 500, headers: corsHeaders },
      );
    }

    const { token, action } = (await req.json()) as {
      token?: string;
      action?: string;
    };

    if (!token) {
      return Response.json(
        { success: false, error: "Missing token" },
        { status: 400, headers: corsHeaders },
      );
    }

    const verifyPayload = new URLSearchParams();
    verifyPayload.set("secret", secret);
    verifyPayload.set("response", token);

    const verifyResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: verifyPayload.toString(),
      },
    );

    const verifyData = (await verifyResponse.json()) as RecaptchaVerifyResponse;

    if (!verifyData.success) {
      return Response.json(
        {
          success: false,
          error: "Captcha verification failed",
          codes: verifyData["error-codes"] ?? [],
        },
        { status: 401, headers: corsHeaders },
      );
    }

    return Response.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders },
    );
  }
});
