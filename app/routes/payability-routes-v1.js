//Set up
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

//Routes go here

router.post('/funding-scenario', function(request, response) {
 
  var fundingScenario = request.session.data['funding-scenario'];
  if (fundingScenario === "Health authority" || fundingScenario === "Claimant" || fundingScenario === "Not known") {
      response.redirect("payability/v1/stay/check-answers2")
  } else {
    response.redirect("payability/v1/stay/funding-address")
}
})

router.post('/add-another-stay', function(request, response) {
 
  var addAnotherStay = request.session.data['add-another-stay'];
  if (addAnotherStay === "Yes") {
      response.redirect("payability/v1/stay/type")
  } else {
    response.redirect("payability/v1/stay/review-payment")
}
})


//export routes
module.exports = router;