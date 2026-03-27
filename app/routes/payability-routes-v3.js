//Set up
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// ---------------------------------------------
// Update stay completion values
// ---------------------------------------------
function updateStayObject(req) {
  const d = req.session.data;
  if (!d.stays || d.stayIndex === undefined) return;

  const stay = d.stays[d.stayIndex];
  if (!stay) return;

  // Update core values
  stay.type = d['type-scenario'] || stay.type;
  stay.name = d['accommodation-name'] || d['address-name'] || stay.name;

  // Completion rules (Not null, not empty, not “I don't know”)
  function completed(val) {
    return val && val !== "I don't know" && val !== "";
  }

  stay.completed = stay.completed || {};

  // --- Main questions ---
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
    completed(d['accommodation-select-an-address']);

  stay.completed.fundingType = completed(d['funding-scenario']);

  stay.completed.repay = completed(d['repayment-scenario']);

  
      // --- Additional details ---
  stay.completed.boarder = completed(d['boarder-scenario']);

  stay.completed.similarInstitution = completed(d['similar-institution']);

  stay.completed.contact =
    completed(d['contactCheck']) 

  stay.completed.fundingAddress = completed(d['fundingAddressCheck']);

  stay.completed.fundingContact = completed(d['fundingContactCheck']);


}

// ---------------------------------------------
// Existing routes (your full file, unchanged except update calls)
// ---------------------------------------------

const stayTaskOrder = [
  { key: 'type', url: '/payability/v3/stay/type' },
  { key: 'startDate', url: '/payability/v3/stay/date-in' },
  { key: 'endDate', url: '/payability/v3/stay/date-left' },
  { key: 'address', url: '/payability/v3/stay/accommodation-lookup-name' },
  { key: 'funding', url: '/payability/v3/stay/funding-type' },
  { key: 'boarder', url: '/payability/v3/stay/accommodation-boarder' },
  { key: 'repay', url: '/payability/v3/stay/repay' },
  { key: 'hospitalCheck', url: '/payability/v3/stay/similar-institution' },
  { key: 'contact', url: '/payability/v3/stay/accommodation-contact-check' }
];

router.post('/agent', function (req, res) {
  const chosenScenario = req.body['PayabilityScenario'];
  const chosenPersona  = req.session.data['PayabilityPersona'];

  req.session.data = {};
  req.session.data['PayabilityScenario'] = chosenScenario;
  req.session.data['PayabilityPersona']  = chosenPersona;

  res.redirect('/payability/v3/agent');
});

router.post('/add-another-stay', function(req, res) {
  updateStayObject(req);
  var addAnotherStay = req.session.data['add-another-stay'];
  if (addAnotherStay === "Yes") {
      res.redirect("payability/v3/stay/type")
  } else {
    res.redirect("payability/v3/stay/review-payment")
  }
});

router.post('/hospital-check', function (req, res) {
  req.session.data.isAddingStay = true;
  delete req.session.data.stayIndex;
  delete req.session.data.editIndex;

  const persona = req.session.data['PayabilityPersona'];

  if (persona === "Agent starting a new claim") {
    return res.redirect("payability/v3/stay/accommodation-hospital-check");
  } else {
    return res.redirect("payability/v3/stay/type");
  }
});

router.post('/hospital-or-hospice', function(req, res) {
  updateStayObject(req);
  var hospitalOrHospice = req.session.data['type-scenario'];
  if (hospitalOrHospice === "No") {
      res.redirect("payability/v3/stay/type")
  } else {
    res.redirect("payability/v3/stay/date-yesterday-check")
  }
});

router.post('/in-accommodation-check', function (req, res) {
  updateStayObject(req);
  const data = (req.session && req.session.data) || {};
  const personaSelection = data['PayabilityPersona'];
  const inAccommodation = data['type-scenario']; 

  if (inAccommodation === 'None of these') {
    return res.redirect('payability/v3/stay/check-answers');
  } else if (personaSelection === 'Agent starting a new claim') {
    return res.redirect('payability/v3/stay/date-yesterday-check');
  } else {
    return res.redirect('payability/v3/stay/date-in');
  }
});

router.post('/yesterday-check', function(req, res) {
  updateStayObject(req);
  var yesterdayCheck = req.session.data['type-scenario'];
  if (yesterdayCheck === "Hospital") {
      res.redirect("payability/v3/stay/accommodation-lookup-name")
  } else {
    res.redirect("payability/v3/stay/accommodation-boarder")
  }
});

router.post('/still-there-check', function (req, res) {
  updateStayObject(req);
  const data = req.session.data || {};

  const stillThere = data['date-out-check'];
  const typeScenario = data['type-scenario'];

  if (stillThere === "No") {
    return res.redirect("payability/v3/stay/date-left");
  }
  return res.redirect("payability/v3/stay/accommodation-lookup-name");
});

router.post('/boarder-check', function(req, res) {
  updateStayObject(req);
  var boarderCheck = req.session.data['boarder-scenario'];
  if (boarderCheck === "Yes") {
      res.redirect("payability/v3/stay/accommodation-boarder-detail")
  } else {
    res.redirect("payability/v3/stay/repay")
  }
});

router.post('/address-check', function(req, res) {
  updateStayObject(req);
  var addressCheck = req.session.data['addressCheck'];
  if (addressCheck === "Yes") {
      res.redirect("payability/v3/stay/accommodation-lookup-start")
  } else {
    res.redirect("payability/v3/stay/accommodation-contact-check")
  }
});

router.post('/contact-check', function(req, res) {
  updateStayObject(req);
  var addressCheck = req.session.data['contactCheck'];
  var prisonCheck = req.session.data['type-scenario']

  if (addressCheck === "Yes") {
      res.redirect("payability/v3/stay/accommodation-contact-select")
  } else if (prisonCheck === 'Detention in Legal Custody') {
    return res.redirect('payability/v3/stay/check-answers');
  } else {
    res.redirect("payability/v3/stay/accommodation-lookup-name")
  }
});

router.post('/persona-selection', function(req, res) {
  updateStayObject(req);
  var personaSelection = req.session.data['PayabilityPersona'];
  if (personaSelection === "Agent handling an ongoing claim") {
      res.redirect("payability/v3/scenario")
  } else {
    res.redirect("payability/v3/stay/accommodation-hospital-check")
  }
});

router.post('/funding-check', function(req, res) {
  updateStayObject(req);
  var fundingCheck = req.session.data['PayabilityPersona'];
  if (fundingCheck === "Agent handling an ongoing claim") {
      res.redirect("payability/v3/stay/funding-lookup-name")
  } else {
    res.redirect("payability/v3/stay/funding-claimant-check")
  }
});

router.post('/claimant-funded-check', function(req, res) {
  updateStayObject(req);
  var selfFunded = req.session.data['claimantFunded'];
  if (selfFunded === "No") {
      res.redirect("payability/v3/stay/funding-type")
  } else {
    res.redirect("payability/v3/stay/check-answers")
  }
});

router.post('/funding-scenario-v3', function(req, res) {
  updateStayObject(req);
  var fundingSkip = req.session.data['funding-scenario'];
  if (fundingSkip === "No, none of these" || fundingSkip === "I don't know" || fundingSkip === "Claimant" || fundingSkip === "Health authority" || fundingSkip === "NHS" ) {
      res.redirect("payability/v3/stay/check-answers")
    } else {  
    res.redirect("payability/v3/stay/funding-name")
  }
});

router.post('/funding-address-check', function(req, res) {
  updateStayObject(req);
  var fundingSkip = req.session.data['fundingAddressCheck'];
  if (fundingSkip === "Yes" ) {
      res.redirect("payability/v3/stay/funding-lookup-name")
    } else {  
    res.redirect("payability/v3/stay/funding-contact-check")
  }
});

router.post('/funding-contact-check', function(req, res) {
  updateStayObject(req);
  var fundingContactCheck = req.session.data['fundingContactCheck'];
  if (fundingContactCheck === "Yes" ) {
      res.redirect("payability/v3/stay/funding-contact-select")
    } else {  
    res.redirect("payability/v3/stay/accommodation-boarder")
  }
});

// ---- SAVE STAY (unchanged except stays get updated) ----

router.post('/save-stay', (req, res) => {
  const d = req.session.data;

  d.stays = d.stays || [];

  const ongoing = d['date-out-check'] === 'Yes';

  const stay = {
    id: d.isAddingStay ? d.stays.length : d.stayIndex,
    name: d['accommodation-name'] || d['address-name'] || 'Accommodation',
    type: d['type-scenario'] || null,
    startDate: {
      day: d['date-in-day'],
      month: d['date-in-month'],
      year: d['date-in-year']
    },
    endDate: ongoing ? null : {
      day: d['date-out-day'],
      month: d['date-out-month'],
      year: d['date-out-year']
    },
    open: ongoing,
    boarderStatus: d['boarder-scenario'] || null,
    fundingType: d['funding-type'] || null,
    claimantFunded: d['claimantFunded'] || null,
    contactDetails: {
      name: d['funding-primary-contact'] || null,
      email: d['funding-email'] || null,
      phone: d['funding-phone-number'] || null
    },
    address: {
      name: d['address-name'],
      line1: d['address-line-1'],
      town: d['address-town'],
      postcode: d['address-postcode']
    },
    dateRecorded: d.dateRecorded || new Date().toLocaleDateString('en-GB'),
    dateCompleted: ongoing ? null : new Date().toLocaleDateString('en-GB'),
    completed: {} // updated by helper
  };

  if (d.isAddingStay) {
    d.stays.push(stay);
    d.isAddingStay = false;
    d.stayIndex = stay.id;
  } else {
    d.stays[d.stayIndex] = stay;
  }

  updateStayObject(req); // ← makes task list update immediately

  res.render('payability/v3/person-record/stay-task-list', {
    stay,
    stays: d.stays
  });
});

router.get('/payability/v3/stay/:id/overview', function (req, res) {
  const d = req.session.data;
  const id = Number(req.params.id);

  d.stayIndex = id;
  d.isAddingStay = false;

  res.render('payability/v3/person-record/stay-overview');
});

router.get('/payability/v3/stay/task-list', function (req, res) {
  const d = req.session.data;
  const stay = d.stays[d.stayIndex];

  res.render('payability/v3/person-record/stay-task-list', {
    stay,
    stays: d.stays
  });
});

//export routes
module.exports = router;
