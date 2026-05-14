const fs = require("fs");
const file = "C:/Users/HP/Desktop/airbnb-api/src/services/ai.service.ts";
let c = fs.readFileSync(file, "utf8");

// Fix chat brevity
c = c.split(
  "      new SystemMessage(systemPrompt),"
).join(
  '      new SystemMessage(systemPrompt + "\\n\\nKeep all replies under 3 sentences. Be direct and concise."),'
);

// Fix summarizeReviews
c = c.split(
  '"summary": "2-3 sentence overall summary",'
).join(
  '"summary": "1 sentence only, max 20 words",'
);

c = c.split(
  '"positives": ["thing1", "thing2", "thing3"],'
).join(
  '"positives": ["short phrase under 6 words", "short phrase under 6 words"],'
);

c = c.split(
  '"negatives": ["thing1"] or []'
).join(
  '"negatives": ["short phrase under 6 words"] or []'
);

c = c.split(
  'Summarize these guest reviews:'
).join(
  'Summarize these guest reviews in the shortest possible way:'
);

fs.writeFileSync(file, c, "utf8");
console.log("chat fixed:", c.includes("under 3 sentences"));
console.log("summary fixed:", c.includes("1 sentence only"));
