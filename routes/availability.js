const express = require('express');
const fs = require('fs');
const router = express.Router();

const availabilityFile = './data/availability.json';

const readJSON = (file) => JSON.parse(fs.readFileSync(file));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Add unavailable date(s) for a member
router.post('/add', (req, res) => {
  const { member, dates } = req.body;

  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ message: "No dates provided" });
  }

  const data = readJSON(availabilityFile);

  if (!data.members[member]) {
    data.members[member] = [];
  }

  const added = [];

  for (const d of dates) {
    const formatted = formatDate(d);

    if (!data.members[member].includes(formatted)) {
      data.members[member].push(formatted);
      added.push(formatted);
    }
  }

  writeJSON(availabilityFile, data);

  res.json({
    message: `Added ${added.length} unavailable date(s) for ${member}`,
    added
  });
});


// Delete an unavailable date for a member
router.post('/delete', (req, res) => {
  const { member, date } = req.body;

  const data = readJSON(availabilityFile);

  if (!data.members[member]) {
    return res.status(404).json({ message: "Member not found" });
  }

  // Remove the date
  data.members[member] = data.members[member].filter(d => d !== date);

  writeJSON(availabilityFile, data);

  res.json({ message: `${member} is now available on ${date}` });
});


// List all unavailable dates per member
router.get('/list', (req, res) => {
  const data = readJSON(availabilityFile);

  const formattedMembers = {};

  for (const member in data.members) {
    formattedMembers[member] = data.members[member].map(formatDate);
  }

  res.json(formattedMembers);
});


module.exports = router;
