const FEISHU_API = "https://open.feishu.cn/open-apis";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function getTenantToken(env) {
  const response = await fetch(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: env.FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET
    })
  });
  const data = await response.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Feishu token error: ${data.code} ${data.msg || ""}`);
  }
  return data.tenant_access_token;
}

async function insertRecord(token, env, payload) {
  const fields = {
    "姓名": payload.name,
    "公司": payload.company || "",
    "WhatsApp号码": payload.whatsapp,
    "城市": payload.city || "",
    "品类": payload.categoryLabel || payload.category,
    "需求描述": payload.product,
    "数量": payload.quantity || "",
    "预算": payload.budget || "",
    "清关责任": payload.customsLabel || payload.customs,
    "期望到货时间": payload.deliveryLabel || payload.delivery,
    "页面语言": payload.lang || "",
    "来源": payload.source || "",
    "提交时间": payload.submittedAt || new Date().toISOString()
  };

  const response = await fetch(
    `${FEISHU_API}/bitable/v1/apps/${env.FEISHU_APP_TOKEN}/tables/${env.FEISHU_TABLE_ID}/records`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields })
    }
  );
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Feishu insert error: ${data.code} ${data.msg || ""}`);
  }
  return data.data;
}

export async function onRequestPost({ request, env }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const required = ["name", "whatsapp", "category", "product"];
  const missing = required.filter((key) => !payload[key]);
  if (missing.length) {
    return json({ ok: false, error: "missing_fields", fields: missing }, 400);
  }

  if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET || !env.FEISHU_APP_TOKEN || !env.FEISHU_TABLE_ID) {
    console.warn("Feishu environment variables are not configured");
    return json({ ok: false, error: "not_configured" }, 200);
  }

  try {
    const token = await getTenantToken(env);
    const data = await insertRecord(token, env, payload);
    return json({ ok: true, recordId: data.record?.record_id || null });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "backup_failed" }, 500);
  }
}
