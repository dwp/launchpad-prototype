//Set up
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

//Routes go here



router.post('/add-another-stay', function(request, response) {
 
  var addAnotherStay = request.session.data['add-another-stay'];
  if (addAnotherStay === "Yes") {
      response.redirect("payability/v2/stay/type")
  } else {
    response.redirect("payability/v2/stay/review-payment")
}
})


router.post('/hospital-check', function(request, response) {
 
  var hospitalCheck = request.session.data['PayabilityPersona'];
  if (hospitalCheck === "Agent starting a new claim") {
      response.redirect("payability/v2/stay/accommodation-hospital-check")
  } else {
    response.redirect("payability/v2/stay/type")
}
})

router.post('/hospital-or-hospice', function(request, response) {
 
  var hospitalOrHospice = request.session.data['type-scenario'];
  if (hospitalOrHospice === "No") {
      response.redirect("payability/v2/stay/type")
  } else {
    response.redirect("payability/v2/stay/date-yesterday-check")
}
})





router.post('/in-accommodation-check', function (req, res) {
  const data = (req.session && req.session.data) || {};
  const personaSelection = data['PayabilityPersona'];
  const inAccommodation = data['type-scenario']; 

  if (inAccommodation === 'None of these') {
    return res.redirect('payability/v2/stay/check-answers');
  } else if (personaSelection === 'Agent starting a new claim') {
    return res.redirect('payability/v2/stay/date-yesterday-check');
  } else {
    return res.redirect('payability/v2/stay/date-in');
  }
});



router.post('/yesterday-check', function(request, response) {
 
  var yesterdayCheck = request.session.data['type-scenario'];
  if (yesterdayCheck === "Hospital") {
      response.redirect("payability/v2/stay/accommodation-lookup-name")
  } else {
    response.redirect("payability/v2/stay/accommodation-boarder")
}
})






router.post('/still-there-check', function (req, res) {
  const data = req.session.data || {};

  const stillThere = data['date-out-check'];        // Yes / No / Unknown
  const typeScenario = data['type-scenario'];       // Hospital / Hostel / Care Home / etc.

  // 1. If claimant is NOT still there → ask date they left
  if (stillThere === "No") {
    return res.redirect("payability/v2/stay/date-left");
  }

  // 2. If still there OR unknown → check accommodation type
  if (typeScenario === "Hospital") {
    return res.redirect("payability/v2/stay/accommodation-lookup-name");
  }

  // 3. Not a hospital → continue to next accommodation screen
  return res.redirect("payability/v2/stay/accommodation-boarder");
});






router.post('/boarder-check', function(request, response) {
 
  var boarderCheck = request.session.data['boarder-scenario'];
  if (boarderCheck === "Yes") {
      response.redirect("payability/v2/stay/accommodation-boarder-detail")
  } else {
    response.redirect("payability/v2/stay/accommodation-lookup-name")
}
})




router.post('/address-check', function(request, response) {
 
  var addressCheck = request.session.data['addressCheck'];
  if (addressCheck === "Yes") {
      response.redirect("payability/v2/stay/accommodation-lookup-start")
  } else {
    response.redirect("payability/v2/stay/accommodation-contact-check")
}
})


router.post('/contact-check', function(request, response) {
 
  var addressCheck = request.session.data['contactCheck'];
  if (addressCheck === "Yes") {
      response.redirect("payability/v2/stay/accommodation-contact")
  } else {
    response.redirect("payability/v2/stay/funding-type")
}
})










router.post('/persona-selection', function(request, response) {
 
  var personaSelection = request.session.data['PayabilityPersona'];
  if (personaSelection === "Agent handling an ongoing claim") {
      response.redirect("payability/v2/scenario")
  } else {
    response.redirect("payability/v2/stay/accommodation-hospital-check")
}
})



router.post('/funding-check', function(request, response) {
 
  var fundingCheck = request.session.data['PayabilityPersona'];
  if (fundingCheck === "Agent handling an ongoing claim") {
      response.redirect("payability/v2/stay/funding-type")
  } else {
    response.redirect("payability/v2/stay/funding-claimant-check")
}
})

router.post('/claimant-funded-check', function(request, response) {
 
  var selfFunded = request.session.data['claimantFunded'];
  if (selfFunded === "No") {
      response.redirect("payability/v2/stay/funding-type")
  } else {
    response.redirect("payability/v2/stay/check-answers")
}
})





router.post('/funding-scenario-v2', function(request, response) {
 var fundingSkip = request.session.data['funding-scenario'];
 
 
  if (fundingSkip === "No, none of these" || fundingSkip === "I don't know" || fundingSkip === "Claimant" || fundingSkip === "Health authority" || fundingSkip === "NHS" ) {
      response.redirect("payability/v2/stay/check-answers")
    } else {  
    response.redirect("payability/v2/stay/funding-name")
}
})




router.post('/funding-address-check', function(request, response) {
 var fundingSkip = request.session.data['fundingAddressCheck'];
 
 
  if (fundingSkip === "Yes" ) {
      response.redirect("payability/v2/stay/funding-lookup-name")
    } else {  
    response.redirect("payability/v2/stay/funding-contact-check")
}
})

router.post('/funding-contact-check', function(request, response) {
 var fundingContactCheck = request.session.data['fundingContactCheck'];
 
 
  if (fundingContactCheck === "Yes" ) {
      response.redirect("payability/v2/stay/funding-contact")
    } else {  
    response.redirect("payability/v2/stay/repay")
}
})



// router.post('/accommodation-address', function (req, res) {
//   const data = req.body;
//   const errors = {};

//   if (!data['accommodation-name']) {
//     errors['accommodation-name'] = { text: "Enter the accommodation name" };
//   }

//   if (!data['address-town']) {
//     errors['address-town'] = { text: "Enter the town or city" };
//   }

//   if (Object.keys(errors).length) {
//     return res.render('payability/v2/stay/accommodation-address.html', { data, errors });
//   }
  

//   res.redirect('payability/v2/stay/accommodation-contact-check');
// });




//export routes
module.exports = router;