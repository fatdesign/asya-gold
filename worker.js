export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // --- API: Produkte abrufen ---
      if (path === "/api/products" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- API: Produkt hinzufügen / bearbeiten ---
      if (path === "/api/products" && method === "POST") {
        const data = await request.json();
        const { id, title, category, price, image, active, stock } = data;

        if (id) {
           console.log("Prüfe Update für ID:", id);
           const existing = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(id).first();
           if (existing) {
              await env.DB.prepare(
                "UPDATE products SET title = ?, category = ?, price = ?, image_url = ?, active = ?, stock = ? WHERE id = ?"
              ).bind(title, category, price, image, active ? 1 : 0, stock || 0, id).run();
              return new Response(JSON.stringify({ success: true, message: "Produkt aktualisiert", id: id }), { headers: corsHeaders });
           }
        }

        // Neu anlegen
        await env.DB.prepare(
          "INSERT INTO products (title, category, price, image_url, active, stock) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(title, category, price, image, active ? 1 : 0, stock || 0).run();
        
        return new Response(JSON.stringify({ success: true, message: "Created" }), { headers: corsHeaders });
      }

      // --- API: Produkt löschen ---
      if (path.startsWith("/api/products/") && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- API: Bild Upload zu R2 ---
      if (path === "/api/upload" && method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) return new Response("No file", { status: 400 });

        const fileName = `${Date.now()}-${file.name}`;
        await env.ASSETS.put(fileName, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        // Rückgabe der URL (Annahme: R2 ist via Custom Domain oder Worker-Route erreichbar)
        // Hier geben wir den Pfad zurück, den der Worker später auflösen kann
        return new Response(JSON.stringify({ 
          url: `https://asya-gold.f-klavun.workers.dev/images/${fileName}`,
          fileName: fileName 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- Bilder aus R2 ausliefern ---
      if (path.startsWith("/images/")) {
        const fileName = path.split("/").pop();
        const object = await env.ASSETS.get(fileName);

        if (!object) return new Response("Not Found", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(object.body, { headers });
      }

      // --- API: Checkout (Lagerbestand abziehen) ---
      if (path === "/api/checkout" && method === "POST") {
        const { items } = await request.json();
        for (const item of items) {
          await env.DB.prepare(
            "UPDATE products SET stock = MAX(0, stock - 1) WHERE id = ?"
          ).bind(item.id).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // --- API: Einstellungen abrufen ---
      if (path === "/api/settings" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM settings").all();
        const settings = {};
        results.forEach(r => settings[r.key] = r.value);
        return new Response(JSON.stringify(settings), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // --- API: Einstellungen speichern ---
      if (path === "/api/settings" && method === "POST") {
        const data = await request.json();
        for (const [key, value] of Object.entries(data)) {
          await env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
            .bind(key, value)
            .run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      return new Response("Not Found", { status: 404 });

    } catch (err) {
      return new Response(err.message, { status: 500, headers: corsHeaders });
    }
  },
};
