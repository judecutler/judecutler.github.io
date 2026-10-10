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
      title: "Sasebo Smile",
      description: "Intercultural nonprofit orchestrating bilingual education & experiences in southern Japan.",
      link: "https://sasebo-merch.square.site/",
      linkLabel: "View project",
      tags: ["Service"],
    },
    {
      title: "More Coming...",
      description: "Expect something here very shortly",
      tags: ["Unfinished"],
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
    { text: "Make a music video", done: true },
    { text: "Tame a crow", done: false },
    { text: "Reach B1+ in 5 Languages", done: true },
    { text: "Build something other people use every day", done: false },
    { text: "Speak to an Elder in Chinese", done: false },
    { text: "Start a YouTube Channel", done: false },
    { text: "Compete in a Pentathlon", done: false },
    { text: "Learn to Sing", done: false },
  ],

  
    // ------------------------------------------------------------------------
  // ACHIEVEMENTS (the scrolling "unlocked" bar under the hero)
  //   name     the achievement's title, like a game would name it
  //   text     what you actually did
  //   rarity   (optional) your best guess at the % of people who've done it,
  //            as a plain number: 0.4 means "0.4% of people"
  // The bar starts at the first item, so newest-first reads well.
  // Rarity colors the card: under 5 is amber, under 20 is mint, else cream.
  // ------------------------------------------------------------------------
  achievements: [
    { name: "Cubed", text: "Solve Rubik's Cube in under 30s", rarity: 10 },
    { name: "Rated Player", text: "Reached 1000 Elo on Chess.com", rarity: 30 },
    { name: "Bongga Ka Day", text: "Learn Tagalog", rarity: 1 },
    { name: "Krankenwagen", text: "Learn German", rarity: 2 },
    { name: "Collier Cadence", text: "Learn 5 way polyrithm on one hand", rartiy: 2}
  ],

  
  // ------------------------------------------------------------------------
  // TIMELINE 
  //   date   
  //   title  
  //   text   
  // ------------------------------------------------------------------------
  timeline: [
    {
      date: "2009",
      title: "Born in San Diego",
      text: "As the first of two kids to a small working class family.",
    },
    {
      date: "2022",
      title: "Moved to Sasebo, Japan",
      text: "Took the DSD I; First time living abroad",
    },
    {
      date: "2025",
      title: "First Real Win",
      text: "Got Best Delegate in YMUNS, made me believe I could do more",
    },
    {
      date: "Present",
      title: "Enrolled at UC Berkeley",
      text: "Using every opportunity I have; making memories",
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
      year: "2026",
      title: "Coke Scholar",
      org: "First DoDEA selectee in ~12 years",
      description: "Selected from over 100,000 applicants for leadership, academic excellence, and service.",
      link: "https://www.coca-colascholarsfoundation.org/about/2026-scholar-bios/",
    },
    {
      year: "2026",
      title: "Military Youth of the Year Asia",
      org: "Boys and Girls Clubs of America",
    },
    {
      year: "2026",
      title: "U.S. Presidential Scholar ",
      org: "Semifinalist (Ongoing)",
      link: "https://www.ed.gov/media/document/2026-presidential-scholars-program-semifinalists-may-22-2026-114041.pdf",
    },
  ],
};
