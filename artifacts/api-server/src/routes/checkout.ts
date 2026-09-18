import { Router, type IRouter } from "express";
import {
  CreateCheckoutBody,
  CreateCheckoutResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/checkout/create", async (req, res): Promise<void> => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_EMAIL" });
    return;
  }

  try {
    const upstream = await fetch("https://fitxlab.com/api/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "FitX-01",
      },
      body: JSON.stringify({
        productKey: "shoes",
        email: parsed.data.email,
        ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
        options: { color: parsed.data.color },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const payload: unknown = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      res.status(upstream.status).json(payload);
      return;
    }

    const response = CreateCheckoutResponse.safeParse(payload);
    if (!response.success) {
      req.log.error(
        { errors: response.error.message },
        "FitX checkout returned an invalid response",
      );
      res.status(502).json({ code: "SHOPIFY_UNAVAILABLE" });
      return;
    }

    res.json(response.data);
  } catch (error) {
    req.log.error({ err: error }, "FitX checkout request failed");
    res.status(502).json({ code: "SHOPIFY_UNAVAILABLE" });
  }
});

export default router;