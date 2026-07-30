<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{title}}</title>
<style>*{box-sizing:border-box;}body{font-family:system-ui,sans-serif;margin:0;}section{padding:4rem 2rem;max-width:960px;margin:0 auto;}.hero{text-align:center;padding:6rem 2rem;background:linear-gradient(135deg,#1e293b,#3b82f6);color:#fff;}.features{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.5rem;}</style>
</head><body>
<section class="hero" style="max-width:100%;"><h1 style="font-size:3rem;margin-bottom:1rem">{{title}}</h1><p style="font-size:1.2rem;opacity:0.85">{{requirement}}</p><a href="#features" style="display:inline-block;margin-top:2rem;padding:0.8rem 2rem;background:#fff;color:#1e293b;border-radius:4px;font-weight:bold;text-decoration:none">Get Started</a></section>
<section id="features"><h2>Features</h2><div class="features">{{featuresHtml}}</div></section>
<section style="text-align:center;background:#f1f5f9;padding:4rem 2rem;max-width:100%;"><h2>Ready to start?</h2><a href="#" style="display:inline-block;padding:0.8rem 2.5rem;background:#3b82f6;color:#fff;border-radius:4px;text-decoration:none;font-weight:bold">Start Now</a></section>
</body></html>
