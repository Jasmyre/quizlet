import type { Flashcard } from "../_lib/types";

export const mockFlashcards = [
  {
    id: "card-01",
    term: "Mitochondria",
    definition: "The organelle that produces most of a cell's ATP.",
    hint: "Often called the powerhouse of the cell.",
    tags: ["biology", "cells"],
  },
  {
    id: "card-02",
    term: "Osmosis",
    definition: "The diffusion of water across a semipermeable membrane.",
    hint: "Water moves from low solute concentration to high solute concentration.",
    tags: ["biology", "transport"],
  },
  {
    id: "card-03",
    term: "Enzyme",
    definition: "A biological catalyst that speeds up chemical reactions.",
    hint: "Usually a protein.",
    tags: ["biology", "chemistry"],
  },
  {
    id: "card-04",
    term: "DNA",
    definition: "The molecule that carries hereditary information.",
    hint: "Double helix.",
    tags: ["biology", "genetics"],
  },
  {
    id: "card-05",
    term: "Magna Carta",
    definition: "A 1215 English charter that limited the power of the king.",
    hint: "Seen as an early step toward constitutional government.",
    tags: ["history", "government"],
  },
  {
    id: "card-06",
    term: "French Revolution",
    definition:
      "A period of political and social upheaval in France beginning in 1789.",
    hint: "Included the fall of the monarchy and rise of new political ideals.",
    tags: ["history", "europe"],
  },
  {
    id: "card-07",
    term: "Industrialization",
    definition:
      "The transition to machine-based manufacturing and large-scale industry.",
    hint: "Closely tied to factories and urbanization.",
    tags: ["history", "economics"],
  },
  {
    id: "card-08",
    term: "World War II",
    definition:
      "A global conflict fought from 1939 to 1945 involving the Allies and Axis powers.",
    hint: "The deadliest conflict in human history.",
    tags: ["history", "war"],
  },
  {
    id: "card-09",
    term: "Derivative",
    definition: "A measure of how a function changes at a specific point.",
    hint: "Used to find slope in calculus.",
    tags: ["math", "calculus"],
  },
  {
    id: "card-10",
    term: "Pythagorean theorem",
    definition:
      "In a right triangle, a squared plus b squared equals c squared.",
    hint: "Relates the sides of a right triangle.",
    tags: ["math", "geometry"],
  },
  {
    id: "card-11",
    term: "Quadratic formula",
    definition: "The formula used to solve ax squared plus bx plus c equals 0.",
    hint: "Often written with a plus-minus sign.",
    tags: ["math", "algebra"],
  },
  {
    id: "card-12",
    term: "Algorithm",
    definition: "A step-by-step procedure for solving a problem.",
    hint: "Can be written in code or plain language.",
    tags: ["computer science", "logic"],
  },
  {
    id: "card-13",
    term: "HTTP",
    definition:
      "A protocol used for transferring hypertext and other web resources.",
    hint: "Found at the core of the web.",
    tags: ["computer science", "web"],
  },
  {
    id: "card-14",
    term: "Binary",
    definition: "A number system that uses only 0 and 1.",
    hint: "Computers use it internally.",
    tags: ["computer science", "number systems"],
  },
  {
    id: "card-15",
    term: "Recursion",
    definition:
      "A process in which a function calls itself to solve smaller parts of a problem.",
    hint: "Often has a base case.",
    tags: ["computer science", "programming"],
  },
  {
    id: "card-16",
    term: "Metaphor",
    definition: "A figure of speech that directly compares two unlike things.",
    hint: "Unlike a simile, it does not use like or as.",
    tags: ["literature", "language"],
  },
  {
    id: "card-17",
    term: "Thesis statement",
    definition: "A sentence that states the main argument of an essay.",
    hint: "Usually appears near the end of the introduction.",
    tags: ["writing", "literature"],
  },
  {
    id: "card-18",
    term: "Tone",
    definition: "The author's attitude toward the subject or audience.",
    hint: "Can be formal, playful, critical, or sincere.",
    tags: ["literature", "analysis"],
  },
] satisfies Flashcard[];
