const express = require('express');
const fs = require('fs');
const router = express.Router();

const gigsFile = './data/gigs.json';
const availabilityFile = './data/availability.json';

// Helper to read JSON
const readJSON = (file) => JSON.parse(fs.readFileSync(file));

// Helper to write JSON
const writeJSON = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Add a new gig
router.post("/add", (req, res) => {
  const { venue, date, startTime, pay } = req.body;

  let gigs = readJSON(gigsFile);

  // ❌ Prevent double-booking by date
  const existing = gigs.find(g => g.date === date);
  if (existing) {
    return res.status(400).json({
      message: "A gig already exists on this date",
      existingGig: existing
    });
  }

  const newGig = {
    id: gigs.length + 1,
    venue,
    date: formatDate(date),
    startTime,
    pay
  };

  gigs.push(newGig);
  writeJSON(gigsFile, gigs);

  res.json(newGig);
});


// DELETE GIG (with recycle bin)
router.post("/delete", (req, res) => {
  const { id } = req.body;

  let gigs = readJSON(gigsFile);
  let deleted = readJSON("./data/deleted-gigs.json");

  const index = gigs.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Gig not found" });
  }

  const [gigToDelete] = gigs.splice(index, 1);

  deleted.push({
    ...gigToDelete,
    deletedAt: new Date().toISOString()
  });

  writeJSON(gigsFile, gigs);
  writeJSON("./data/deleted-gigs.json", deleted);

  res.json({ message: "Gig deleted and archived" });
});



// UPDATE GIG
router.post("/update", (req, res) => {
  const { id, venue, date, startTime, pay } = req.body;

  let gigs = readJSON(gigsFile);

  const index = gigs.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Gig not found" });
  }

  gigs[index] = {
    ...gigs[index],
    venue,
    date: formatDate(date),
    startTime,
    pay
  };

  writeJSON(gigsFile, gigs);

  res.json({ message: "Gig updated", gig: gigs[index] });
});


// List gigs sorted by date
router.get('/list', (req, res) => {
  const gigs = readJSON(gigsFile);
  gigs.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(gigs);
});

// Check if band is available for a date
router.get('/check/:date', (req, res) => {
  const rawDate = req.params.date;
  const formattedDate = formatDate(rawDate);

  const availability = readJSON(availabilityFile).members;
  const conflicts = [];

  for (const [member, dates] of Object.entries(availability)) {
    if (dates.includes(formattedDate)) {
      conflicts.push({ member, date: formattedDate });
    }
  }

  if (conflicts.length === 0) {
    res.json({
      available: true,
      message: "All band members are available",
      conflicts: []
    });
  } else {
    res.json({
      available: false,
      message: "Some members are unavailable",
      conflicts
    });
  }
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

module.exports = router;
