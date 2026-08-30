/**
 * tests/bkash.test.js — bKash tokenized checkout service: token grant,
 * payment create/query/refund, and URL/amount helpers. Axios is mocked.
 */
jest.mock("axios");
const axios = require("axios");

jest.mock("../src/config/env.js", () => ({
  __esModule: true,
  default: {
    NODE_ENV: "test",
    BKASH_BASE_URL: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
    BKASH_APP_KEY: "app-key",
    BKASH_APP_SECRET: "app-secret",
    BKASH_USERNAME: "merchant",
    BKASH_PASSWORD: "secret",
    BKASH_EXCHANGE_RATE_BDT_PER_USD: 110,
  },
}));

const bkashService = require("../src/services/bkashService");

describe("bkashService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Route responses by endpoint so the module-level token cache doesn't
    // desync queued mock responses across tests. The create endpoint behaves
    // differently for agreements (mode 0000) vs payments (mode 0001).
    axios.post.mockImplementation(async (url, body) => {
      if (url.includes("/token/grant")) return { data: { id_token: "token-1" } };
      if (url.includes("/checkout/create")) {
        const isAgreement = body && body.mode === "0000";
        return {
          data: isAgreement
            ? { paymentID: "AGRMNT123", bkashURL: "https://pay.bka.sh/agreement/xyz" }
            : { paymentID: "PAY123", bkashURL: "https://pay.bka.sh/xyz" },
        };
      }
      if (url.includes("/checkout/execute")) {
        return { data: { paymentID: body.paymentID, transactionStatus: "Completed", trxID: "BKTX_EXEC" } };
      }
      if (url.includes("/payment/status")) {
        return { data: { paymentID: "PAY", transactionStatus: "Completed", trxID: "BKTX789" } };
      }
      if (url.includes("/payment/refund")) {
        return { data: { refundTrxID: "REFUND1" } };
      }
      return { data: {} };
    });
  });

  it("reports configured when all credentials are present", () => {
    expect(bkashService.isConfigured()).toBe(true);
  });

  it("converts USD totals to integer BDT", () => {
    expect(bkashService.toBdt(41.79)).toBe(4597); // Math.round(41.79 * 110)
    expect(bkashService.toBdt(50)).toBe(5500);
  });

  it("builds the hosted checkout URL from the base origin", () => {
    expect(bkashService.checkoutUrl("PAY123")).toBe(
      "https://tokenized.sandbox.bka.sh/frontend/checkout/PAY123"
    );
  });

  it("grants and caches an id_token", async () => {
    const token = await bkashService.getToken();

    expect(axios.post).toHaveBeenCalledWith(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant",
      { app_key: "app-key", app_secret: "app-secret" },
      expect.objectContaining({
        headers: expect.objectContaining({ username: "merchant", password: "secret" }),
        timeout: 30000,
      })
    );
    expect(token).toBe("token-1");

    // Second call reuses the cached token — no second HTTP request.
    axios.post.mockClear();
    const again = await bkashService.getToken();
    expect(again).toBe("token-1");
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("creates an agreement with mode 0000", async () => {
    const created = await bkashService.createAgreement({
      payerReference: "ORD-1",
      callbackURL: "https://api.example.com/api/payments/bkash/agreement/callback",
    });

    expect(created).toEqual({
      paymentID: "AGRMNT123",
      bkashURL: "https://pay.bka.sh/agreement/xyz",
    });

    const createCall = axios.post.mock.calls.find(([url]) => url.includes("/checkout/create"));
    expect(createCall[1]).toMatchObject({
      mode: "0000",
      payerReference: "ORD-1",
      callbackURL: "https://api.example.com/api/payments/bkash/agreement/callback",
    });
    expect(createCall[1]).not.toHaveProperty("agreementID");
    expect(createCall[1]).not.toHaveProperty("amount");
  });

  it("executes an agreement after the success callback", async () => {
    const result = await bkashService.executeAgreement("AGRMNT123");

    expect(axios.post).toHaveBeenCalledWith(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute",
      { paymentID: "AGRMNT123" },
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "token-1" }) })
    );
    expect(result.transactionStatus).toBe("Completed");
  });

  it("creates a tokenized payment with mode 0001 and the agreementID", async () => {
    const created = await bkashService.createPayment({
      amountBdt: 4597,
      payerReference: "ORD-1",
      merchantInvoiceNumber: "ORD-1",
      agreementID: "AGRMNT123",
      callbackURL: "https://api.example.com/api/payments/bkash/callback",
    });

    expect(created).toEqual({
      paymentID: "PAY123",
      bkashURL: "https://pay.bka.sh/xyz",
    });

    const createCall = axios.post.mock.calls.find(([url]) => url.includes("/checkout/create"));
    expect(createCall).toBeDefined();
    expect(createCall[0]).toBe(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create"
    );
    expect(createCall[1]).toMatchObject({
      mode: "0001",
      agreementID: "AGRMNT123",
      amount: "4597",
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: "ORD-1",
      callbackURL: "https://api.example.com/api/payments/bkash/callback",
    });
    expect(createCall[2].headers.Authorization).toBe("token-1");
    expect(createCall[2].headers["X-APP-Key"]).toBe("app-key");
    expect(createCall[2].timeout).toBe(30000);
  });

  it("executes a payment after the customer completes the bKash page", async () => {
    const result = await bkashService.executePayment("PAY123");
    expect(result).toMatchObject({ paymentID: "PAY123", transactionStatus: "Completed", trxID: "BKTX_EXEC" });
  });

  it("queries payment status with the paymentID", async () => {
    const status = await bkashService.queryPayment("PAY");

    expect(status.transactionStatus).toBe("Completed");
    expect(status.trxID).toBe("BKTX789");
    expect(axios.post).toHaveBeenCalledWith(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/status",
      { paymentID: "PAY" },
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "token-1" }) })
    );
  });

  it("surfaces bKash API error codes as AppErrors", async () => {
    axios.post.mockImplementationOnce(async () => ({
      data: { errorCode: "2001", errorMessage: "Duplicate MerchantInvoiceNumber" },
    }));
    await expect(
      bkashService.createPayment({
        amountBdt: 100,
        payerReference: "ORD-1",
        merchantInvoiceNumber: "ORD-1",
        agreementID: "AGRMNT123",
        callbackURL: "https://api.example.com/api/payments/bkash/callback",
      })
    ).rejects.toMatchObject({ statusCode: 502, code: "BKASH_API_ERROR" });
  });

  it("surfaces bKash statusCode/statusMessage errors (HTTP 200 body) as AppErrors", async () => {
    axios.post.mockImplementationOnce(async () => ({
      data: {
        statusCode: "2054",
        statusMessage: "Agreement execution pre-requisite hasn't been met",
      },
    }));
    await expect(bkashService.executeAgreement("AGRMNT123")).rejects.toMatchObject({
      statusCode: 502,
      code: "BKASH_API_ERROR",
      message: expect.stringContaining("2054"),
    });
  });

  it("refunds a completed payment", async () => {
    const refund = await bkashService.refundPayment({
      paymentID: "PAY",
      trxID: "BKTX789",
      amountBdt: 4597,
      sku: "ORD-1",
      reason: "requested_by_customer",
    });

    expect(refund.refundTrxID).toBe("REFUND1");

    const refundCall = axios.post.mock.calls.find(([url]) => url.includes("/payment/refund"));
    expect(refundCall).toBeDefined();
    expect(refundCall[0]).toBe(
      "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/payment/refund"
    );
    expect(refundCall[1]).toMatchObject({
      paymentID: "PAY",
      amount: "4597",
      trxID: "BKTX789",
    });
  });
});