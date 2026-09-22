import assert from "node:assert/strict";
import { resolveDemoIdentity } from "./auth-demo";

process.env.FOUNDER_EMAILS = "hornsandhalos619@gmail.com, second@example.com";

const six = resolveDemoIdentity("6");
assert.equal(six?.email, "hornsandhalos619@gmail.com");
assert.equal(six?.id, "hornsandhalos619@gmail.com");
assert.equal(six?.name, "6");

const founder = resolveDemoIdentity("HornsAndHalos619@gmail.com");
assert.equal(founder?.email, "hornsandhalos619@gmail.com");
assert.equal(founder?.name, "hornsandhalos619@gmail.com");

assert.equal(resolveDemoIdentity(""), null);
assert.equal(resolveDemoIdentity("not-an-email"), null);

process.env.FOUNDER_EMAILS = "";
assert.equal(resolveDemoIdentity("6"), null);

console.log("auth demo alias ok");
