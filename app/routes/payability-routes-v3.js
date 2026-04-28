// --------------------------------------------------------
// SETUP
// --------------------------------------------------------
const govukPrototypeKit = require('govuk-prototype-kit');
const router = govukPrototypeKit.requests.setupRouter();


// --------------------------------------------------------
// HELPERS
// --------------------------------------------------------

// Used for any field where "completed" means: has value AND not "I don't know"
function completed(val) {
  return val && val !== "I don't know" && val !== "";
}


// Auto-determine the NEXT incomplete task (wizard mode Continue)
function getNextIncompleteTask(stay) {
  if (!stay || !stay.completed) return null;

  const order = [
    { key: "type", url: "/payability/v3/stay/type" },
    { key: "startDate", url: "/payability/v3/stay/date-in" },
    { key: "endDate", url: "/payability/v3/stay/date-left" },
    { key: "address", url: "/payability/v3/stay/accommodation-lookup-name" },
    { key: "funding", url: "/payability/v3/stay/funding-type" },
    { key: "repay", url: "/payability/v3/stay/repay" },
    { key: "boarder", url: "/payability/v3/stay/accommodation-boarder" },
    { key: "similarInstitution", url: "/payability/v3/stay/similar-institution" },
    { key: "contact", url: "/payability/v3/stay/accommodation-contact-check" },
    { key: "fundingAddress", url: "/payability/v3/stay/funding-address-check" },
    { key: "fundingContact", url: "/payability/v3/stay/funding-contact-check" }
  ];

  for (const item of order) {
    if (!stay.completed[item.key]) {
      return item.url;
    }
  }

  return null;
}


// Main updater: updates the stay.completed fields whenever interacting with task screens
function updateStayObject(req) {
  const d = req.session.data;
  if (!d.stays || d.stayIndex === undefined) return;

  const stay = d.stays[d.stayIndex];
  if (!stay) return;

  stay.completed = stay.completed || {};

  // MAIN FIELDS
  stay.completed.type = completed(d['type-scenario']);

  stay.completed.startDate =
    completed(d['date-in-day']) &&
    completed(d['date-in-month']) &&
    completed(d['date-in-year']);

  stay.completed.endDate = stay.open
    ? true
    : (
      completed(d['date-out-day']) &&
      completed(d['date-out-month']) &&
      completed(d['date-out-year'])
    );

  stay.completed.address =
    completed(d['accommodation-select-an-address']) ||
    completed(d['address-line-1']) ||
    completed(d['address-name']);

  stay.completed.funding =
    completed(d['funding-type']) ||
    completed(d['funding-scenario']) ||
    completed(d['claimantFunded']);

  stay.completed.repay = completed(d['repayment-scenario']);


  // ADDITIONAL DETAILS
  stay.completed.boarder = completed(d['boarder-scenario']);
  stay.completed.similarInstitution = completed(d['similar-institution']);

  stay.completed.contact =
    completed(d['funding-primary-contact']) ||
    completed(d['contactCheck']) ||
    completed(d['funding-email']) ||
    completed(d['funding-phone-number']) ||
    (d['contact-options'] && d['contact-options'].length > 0);

  stay.completed.fundingAddress = 
  completed(d['funding-select-an-address']) ||
  completed(d['funding-contact-check']) ||
  completed(d['fundingAddressCheck']);

  stay.completed.fundingContact = completed(d['funding-contact-check']);
}


// --------------------------------------------------------
// CREATE BLANK STAY INSTANCE — ENTRY POINT FOR ADDING A STAY
// --------------------------------------------------------

// Clicking "Add a stay" should land HERE — always start in task list.
router.get('/payability/v3/stay/start', function (req, res) {
  const d = req.session.data;
  d.stays = d.stays || [];

  // Only mark that we intend to create a new stay.
  d.isAddingStay = true;

  // Reset active stay index to null until save
  d.stayIndex = null;

  return res.redirect('/payability/v3/stay/task-list');
});

// --------------------------------------------------------
// AGENT ENTRY ROUTES (UNCHANGED EXCEPT CLEAN-UP)
// --------------------------------------------------------

router.post('/agent', function (req, res) {
  const chosenScenario = req.body['PayabilityScenario'];
  const chosenPersona = req.session.data['PayabilityPersona'];

  // Reset
  req.session.data = {};
  req.session.data['PayabilityScenario'] = chosenScenario;
  req.session.data['PayabilityPersona'] = chosenPersona;

  return res.redirect('/payability/v3/agent');
});


// --------------------------------------------------------
// REPLACES OLD hospital-check LOGIC
// ALWAYS start a stay instance
// --------------------------------------------------------

router.post('/hospital-check', function (req, res) {
  // Go to blank stay creation
  return res.redirect('/payability/v3/stay/start');
});


// --------------------------------------------------------
// REUSABLE CONTINUE LOGIC: jump to next incomplete task
// Used when user presses Continue from task list
// --------------------------------------------------------

router.get('/payability/v3/stay/task-list-continue', function (req, res) {
  const d = req.session.data;
  const stay = d.stays[d.stayIndex];

  updateStayObject(req);

  const next = getNextIncompleteTask(stay);
  if (next) return res.redirect(next);

  return res.redirect('/payability/v3/stay/check-answers');
});

// --------------------------------------------------------
// TASK FLOW ROUTES (Manual edit allowed)
// --------------------------------------------------------

// --- Hospital / hospice logic ---
router.post('/hospital-or-hospice', function(req, res) {
  updateStayObject(req);
  const v = req.session.data['type-scenario'];

  if (v === "No") {
    return res.redirect("/payability/v3/stay/type");
  }
  return res.redirect("/payability/v3/stay/date-yesterday-check");
});


// --- In accommodation check ---
router.post('/in-accommodation-check', function(req, res) {
  updateStayObject(req);

  const d = req.session.data;
  const persona = d['PayabilityPersona'];
  const typeScenario = d['type-scenario'];

  if (typeScenario === 'None of these') {
    return res.redirect('/payability/v3/stay/check-answers');
  }

  if (persona === 'Agent starting a new claim') {
    return res.redirect('/payability/v3/stay/date-yesterday-check');
  }

  return res.redirect('/payability/v3/stay/date-in');
});


// --- Yesterday check ---
router.post('/yesterday-check', function(req, res) {
  updateStayObject(req);
  const t = req.session.data['type-scenario'];

  if (t === "Hospital") {
    return res.redirect("payability/v3/stay/accommodation-lookup-name");
  }
  return res.redirect("payability/v3/stay/accommodation-boarder");
});


// --- Still there? ---
router.post('/still-there-check', function(req, res) {
  updateStayObject(req);
  const d = req.session.data;

  const stillThere = d['date-out-check'];

  if (stillThere === "No") {
    return res.redirect("payability/v3/stay/date-left");
  }

  return res.redirect("payability/v3/stay/accommodation-lookup-name");
});


// --- Boarder check ---
router.post('/boarder-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['boarder-scenario'];

  if (v === "Yes") {
    return res.redirect("payability/v3/stay/accommodation-boarder-detail");
  }

  return res.redirect("payability/v3/stay/similar-institution");
});


// --- Address check ---
router.post('/address-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['addressCheck'];

  if (v === "Yes") {
    return res.redirect("payability/v3/stay/accommodation-lookup-start");
  }

  return res.redirect("payability/v3/stay/accommodation-contact-check");
});

//address routing for prison

router.post('/accommodation-lookup-confirm', function(req, res) {
  var addressRoute = req.session.data['type-scenario'];

  if (addressRoute === "Detention in Legal Custody") {
    return res.redirect("payability/v3/stay/stay-task-list");
  }
  return res.redirect("payability/v3/stay/accommodation-lookup-confirm");
});


// --- Contact check ---
router.post('/contact-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['contactCheck'];
  const scenario = req.session.data['type-scenario'];

  if (v === "Yes") {
    return res.redirect("payability/v3/stay/accommodation-contact-select");
  }

  return res.redirect("payability/v3/stay/funding-address-check");
});


// --- Persona selection ---
router.post('/persona-selection', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['PayabilityPersona'];

  if (v === "Agent handling an ongoing claim") {
    return res.redirect("payability/v3/scenario");
  }

  else if (v === "Agent completing new claim stay end date") {
    return res.redirect("payability/v3/agent/index");
  }

  return res.redirect("payability/v3/stay/accommodation-hospital-check");
});


// --- Funding check ---
router.post('/funding-check', function(req, res) {
  updateStayObject(req);

  const persona = req.session.data['PayabilityPersona'];

  if (persona === "Agent handling an ongoing claim") {
    return res.redirect("payability/v3/stay/funding-address-check");
  }

  return res.redirect("payability/v3/stay/funding-address-check");
});


// --- Claimant funded? ---
router.post('/claimant-funded-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['claimantFunded'];

  if (v === "No") {
    return res.redirect("payability/v3/stay/funding-type");
  }

  return res.redirect("payability/v3/stay/check-answers");
});


// --- Funding scenario ---
router.post('/funding-scenario-v3', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['funding-scenario'];

  const autoEnd = [
    "No, none of these",
    "I don't know",
    "Claimant",
    "Health authority",
    "NHS"
  ];

  if (autoEnd.includes(v)) {
    return res.redirect("payability/v3/stay/check-answers");
  }

  return res.redirect("payability/v3/stay/funding-name");
});


// --- Funding address check ---
router.post('/funding-address-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['fundingAddressCheck'];

  if (v === "Yes") {
    return res.redirect("payability/v3/stay/funding-lookup-name");
  }

  return res.redirect("payability/v3/stay/funding-contact-check");
});


// --- Funding contact check ---
router.post('/funding-contact-check', function(req, res) {
  updateStayObject(req);

  const v = req.session.data['funding-contact-check'];

  if (v === "Yes") {
    return res.redirect("payability/v3/stay/funding-contact-select");
  }

  return res.redirect("payability/v3/person-record/stay-task-list");
});




// --------------------------------------------------------
// STAY OVERVIEW PAGE (when user clicks card on homepage)
// --------------------------------------------------------

router.get('/payability/v3/stay/:id/overview', function (req, res) {
  const d = req.session.data;
  const id = Number(req.params.id);

  d.stayIndex = id;
  d.isAddingStay = false; // editing mode

  res.render('payability/v3/person-record/stay-overview');
});


// --------------------------------------------------------
// TASK LIST PAGE
// --------------------------------------------------------

router.get('/payability/v3/stay/task-list', function (req, res) {
  const d = req.session.data;
  const stay = d.stays[d.stayIndex];

  // ensure the completion state is fresh
  updateStayObject(req);

  res.render('payability/v3/person-record/stay-task-list', {
    stay,
    stays: d.stays
  });
});



// --------------------------------------------------------
// CYCLE THROUGH QUESTIONS, WHEN COMPLETE, GO TO MASTER
// --------------------------------------------------------

router.get('/payability/v3/stay/continue', function (req, res) {
  const d = req.session.data;
  const stay = d.stays[d.stayIndex];

  // Always refresh completion values first
  updateStayObject(req);

  // Determine next incomplete task
  const next = getNextIncompleteTask(stay);

  if (next) {
    return res.redirect(next);        // 🚀 send user to next incomplete question
  } else {
    return res.redirect('/payability/v3/stay/check-all-answers');  // 🎉 everything complete
  }
});

//QUESTION FLOW

//Date left accommodation
router.post('/date-left', function(req, res) {
  var persona = req.session.data['PayabilityPersona'];
  if (persona === "Agent completing new claim stay end date") {
    return res.redirect('/payability/v3/stay/pip-reg-stay-task-list-complete');
  } else {
    return res.redirect('/payability/v3/stay/accommodation-lookup-name');
  }
});


// Serve pip-stay-complete page and manage banner display
router.get('/payability/v3/stay/pip-stay-complete', function(req, res) {
  // Banner displays only on first visit (when flag is set)
  // After rendering, clear the flag so banner won't show on subsequent visits
  const showBanner = req.session.data['stayJustSubmitted'];
  if (showBanner) {
    delete req.session.data['stayJustSubmitted'];
  }
  res.render('payability/v3/stay/pip-stay-complete');
});

// Check your answers 
router.post('/save-stay', function(req, res) {
  var persona = req.session.data['PayabilityPersona'];
  // Set flag so banner displays on page load
  req.session.data['stayJustSubmitted'] = true;
  if (persona === "Agent completing new claim stay end date") {
  return res.redirect('/payability/v3/stay/pip-reg-stay-task-list-complete');
 } else {
    return res.redirect('/payability/v3/stay/accommodation-lookup-name');
  }
})


// --------------------------------------------------------
// EXPORT ROUTER
// --------------------------------------------------------
module.exports = router;