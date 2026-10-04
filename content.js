// ==========================================================================
// content.js — the ONE file you edit to add or change list-style content:
// projects, distinctions (awards), story timeline, and bucket list.
//
// HOW TO ADD SOMETHING
//   1. Find the list you want (projects, distinctions, timeline, challenges).
//   2. Copy one whole block, from the opening { to the closing },
//   3. Paste it right below, and change the text between the quotes.
//
// RULES THAT KEEP THE SITE FROM BREAKING
//   - Keep every block wrapped as   { ... },   (curly braces + trailing comma).
//   - Keep text inside straight quotes "like this".
//   - If your text contains a double quote, write it as \" instead.
//   - Fields marked (optional) can be deleted or left as "".
//   - If the page ever looks empty, a comma or quote is probably missing.
//     Open the browser console (F12) to see which line.
// ==========================================================================

window.SITE_CONTENT = {

  // ------------------------------------------------------------------------
  // PROJECTS — newest first is a good order.
  //   title        the project's name
  //   description  one or two sentences
  //   link         (optional) full address, starting with https://
  //   linkLabel    (optional) text for the link, default "View project"
  //   tags         (optional) short labels, e.g. ["Python", "Team of 4"]
  //   image        (optional) path to a picture, e.g. "project1.jpg"
  //   imageAlt     (optional) describe the picture for screen readers
  // ------------------------------------------------------------------------
  projects: [
    {
      title: "Project name",
      description: "One or two sentences on what it is, who it's for, and what you did.",
      link: "https://example.com",
      linkLabel: "View project",
      tags: ["Tag", "Tag"],
    },
    {
      title: "Another project",
      description: "Keep it short. Links turn the whole card into a button.",
      link: "https://example.com",
      linkLabel: "Read the write-up",
      tags: ["Tag"],
    },
    {
      title: "A project without a link",
      description: "Leave out link and the card simply isn't clickable.",
      tags: ["Tag", "Tag", "Tag"],
    },
  ],

  // ------------------------------------------------------------------------
  // DISTINCTIONS — awards, honors, recognition.
  //   year         short text shown in the round badge (4 characters fits
  //                best, e.g. "2025")
  //   title        name of the award
  //   org          who gave it
  //   description  (optional) one line of context
  //   link         (optional) address with more info
  // ------------------------------------------------------------------------
  distinctions: [
    {
      year: "2025",
      title: "Award or honor name",
      org: "Awarding organization",
      description: "Optional one-line context for why it mattered.",
      link: "",
    },
    {
      year: "2024",
      title: "Another distinction",
      org: "Awarding organization",
    },
    {
      year: "2023",
      title: "A third one",
      org: "Awarding organization",
    },
  ],

  // ------------------------------------------------------------------------
  // TIMELINE (your story) — oldest first.
  //   date   a year, a season, or "Now"
  //   title  (optional) a short headline
  //   text   a sentence or two
  // ------------------------------------------------------------------------
  timeline: [
    {
      date: "2015",
      title: "Replace with a milestone",
      text: "For example, wrote your first line of code, or moved somewhere new.",
    },
    {
      date: "2019",
      title: "Another milestone",
      text: "What happened, and why it changed things.",
    },
    {
      date: "2023",
      title: "Another milestone",
      text: "Keep entries short. The story is in the sequence.",
    },
    {
      date: "Now",
      title: "What you're doing today",
      text: "Where this chapter is headed.",
    },
  ],

  // ------------------------------------------------------------------------
  // CHALLENGES (bucket list)
  //   text   the challenge
  //   done   true when finished, false when still to do
  //   note   (optional) a date or a detail, e.g. "Summer 2025"
  // The progress bar counts the "done: true" items for you.
  // ------------------------------------------------------------------------
  challenges: [
    { text: "Replace these with your own challenges", done: true, note: "Example of a finished one" },
    { text: "Run a half marathon", done: false },
    { text: "Cook five dishes from memory", done: true, note: "Spring 2025" },
    { text: "Build something that other people use every day", done: false },
    { text: "Learn to sail", done: false },
    { text: "Read 25 books in a year", done: false },
    { text: "Visit a country where I don't speak the language", done: true },
    { text: "Give a talk to a room of strangers", done: false },
  ],

};
