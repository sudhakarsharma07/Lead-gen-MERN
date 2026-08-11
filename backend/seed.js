// Optional: seeds a handful of sample prospects so the dashboard isn't empty on first run.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const Prospect = require("./models/Prospect");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/leadgen_crm";

const sample = [
  {
    companyName: "Thameside Lettings Ltd",
    website: "https://thamesidelettings.co.uk",
    country: "UK",
    city: "Reading",
    entityType: "Limited company",
    estimatedUnits: 420,
    employeeCount: 18,
    contactName: "Priya Shah",
    jobTitle: "Operations Director",
    linkedinUrl: "https://linkedin.com/in/example1",
    email: "priya@thamesidelettings.co.uk",
    emailVerified: true,
    phone: "+44 118 000 0000",
    currentSoftware: "Arthur",
    signal: "Hiring 2 ops coordinators",
    source: "Companies House SIC 68320",
    status: "Contacted",
    channelUsed: "LinkedIn",
    messageVersion: "A",
    weekAdded: 1,
    dateLastContacted: new Date(),
    notes: "Connected on LinkedIn, awaiting reply.",
  },
  {
    companyName: "Northgate Property Management",
    website: "https://northgatepm.ie",
    country: "Ireland",
    city: "Dublin",
    entityType: "Limited company",
    estimatedUnits: 900,
    employeeCount: 42,
    contactName: "Conor Byrne",
    jobTitle: "Head of Property Management",
    linkedinUrl: "https://linkedin.com/in/example2",
    email: "conor@northgatepm.ie",
    emailVerified: true,
    phone: "+353 1 000 0000",
    currentSoftware: "Reapit",
    signal: "Recent expansion into Cork",
    source: "ARLA Propertymark directory",
    status: "Booked",
    channelUsed: "Email",
    messageVersion: "B",
    weekAdded: 1,
    dateLastContacted: new Date(),
    interviewBooked: true,
    interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: "Confirmed for research call.",
  },
  {
    companyName: "Maple & Co Block Management",
    website: "https://mapleco-bm.co.uk",
    country: "UK",
    city: "Leeds",
    entityType: "Sole trader",
    estimatedUnits: 80,
    employeeCount: 6,
    contactName: "Sam Whitfield",
    jobTitle: "Managing Director",
    linkedinUrl: "https://linkedin.com/in/example3",
    currentSoftware: "Spreadsheets",
    signal: "Public complaint about software on LinkedIn",
    source: "LinkedIn groups",
    status: "Not contacted",
    messageVersion: "C",
    weekAdded: 2,
    notes: "Sole trader — needs consent before emailing.",
  },
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    await Prospect.deleteMany({});
    await Prospect.insertMany(sample);
    console.log(`Seeded ${sample.length} prospects.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
