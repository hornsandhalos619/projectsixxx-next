import assert from "node:assert/strict";
import { palaceNpcs } from "../../config/palace";
import { scriptedNpcReply } from "./dialogue";
import { defaultSave } from "./types";

function main() {
  for (const npc of palaceNpcs) {
    const { reply, suggested } = scriptedNpcReply(npc.id, npc.topics[0] ?? "the house");
    assert.ok(reply.includes(npc.name) || reply.length > 40, `${npc.id} must answer`);
    assert.ok(suggested.length > 0, `${npc.id} needs suggested topics`);
  }

  const death = scriptedNpcReply("six", "What happens when I die here?", defaultSave());
  assert.match(death.reply, /Threshold|death|Analyze/i);

  const shop = scriptedNpcReply("gatekeeper", "Where do I buy the tees?");
  assert.match(shop.reply, /Shopify|Gallery|shop/i);

  console.log("palace dialogue tests passed");
}

main();
