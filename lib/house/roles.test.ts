import assert from "node:assert/strict";
import { applyGrantedRole, isGrantableRole, roleForEmail } from "../../config/roles";

process.env.FOUNDER_EMAILS = "founder@projectsixxx.com";

assert.equal(roleForEmail("founder@projectsixxx.com"), "founder");
assert.equal(roleForEmail("editor@projectsixxx.com"), "member");
assert.equal(applyGrantedRole("founder@projectsixxx.com", "blog_admin"), "founder");
assert.equal(applyGrantedRole("editor@projectsixxx.com", "blog_admin"), "blog_admin");
assert.equal(applyGrantedRole("editor@projectsixxx.com", "shop_admin"), "shop_admin");
assert.equal(applyGrantedRole("editor@projectsixxx.com", "founder"), "member");
assert.equal(applyGrantedRole("editor@projectsixxx.com", "member"), "member");
assert.equal(isGrantableRole("founder"), false);
assert.equal(isGrantableRole("blog_admin"), true);
assert.equal(isGrantableRole("shop_admin"), true);

console.log("house roles ok");
