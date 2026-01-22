//Set up
const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
 
//Routes go here
  router.post('/funding-scenario', function(request, response) {
 
    var fundingScenario = request.session.data['funding-scenario'];
    if (fundingScenario === "Health authority" || fundingScenario === "Claimant") {
        response.redirect("payability/v1/stay/check-answers")
    } else {
      response.redirect("e2e/home-supporting-evidence")
  }
  })
//export routes
module.exports = router;