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


router.post('/persona-selection', function(request, response) {
 
  var personaSelection = request.session.data['PayabilityPersona'];
  if (personaSelection === "Agent handling an ongoing claim") {
      response.redirect("payability/v2/scenario")
  } else {
    response.redirect("payability/v2/stay/type")
}
})


router.post('/funding-scenario-v2', function(request, response) {
 var fundingSkip = request.session.data['funding-scenario'];
  if (fundingSkip === "Health authority" || fundingSkip === "Claimant" ) {
      response.redirect("payability/v2/stay/check-answers2")
  } else {
    response.redirect("payability/v2/stay/funding-address")
}
})



router.post('/accommodation-address', function (req, res) {
  const data = req.body;
  const errors = {};

  if (!data['accomodation-name']) {
    errors['accomodation-name'] = { text: "Enter the accomodation name" };
  }

  if (!data['address-town']) {
    errors['address-town'] = { text: "Enter the town or city" };
  }

  if (Object.keys(errors).length) {
    return res.render('payability/v2/stay/accomodation-address.html', { data, errors });
  }
  

  res.redirect('payability/v2/stay/accomodation-contact');
});




//export routes
module.exports = router;