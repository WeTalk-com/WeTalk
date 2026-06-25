import { describe, it, expect } from "vitest";
import { extractTags } from "../controllers/post.controller.js";

describe("extractTags", () => {
  it("extrait les #hashtags du contenu", () => {
    expect(extractTags("match de #foot à #paris")).toEqual(["foot", "paris"]);
  });

  it("normalise en lowercase et déduplique", () => {
    expect(extractTags("#Foot #FOOT #foot #Paris")).toEqual(["foot", "paris"]);
  });

  it("gère les accents (regex unicode)", () => {
    expect(extractTags("au #café ce #été")).toEqual(["café", "été"]);
  });

  it("renvoie un tableau vide sans hashtag", () => {
    expect(extractTags("aucun tag ici")).toEqual([]);
  });

  it("ignore le # seul ou suivi de ponctuation", () => {
    expect(extractTags("# vide #! #")).toEqual([]);
  });

  it("plafonne à 10 tags", () => {
    const content = Array.from({ length: 15 }, (_, i) => `#tag${i}`).join(" ");
    expect(extractTags(content)).toHaveLength(10);
  });
});
