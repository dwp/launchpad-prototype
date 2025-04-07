//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Find an address plugin
const findAddressPlugin = require("find-an-address-plugin");

findAddressPlugin(router);  

// Logging session data  
// This code shows in the terminal what session data has been saved.
router.use((req, res, next) => {    
    const log = {  
      method: req.method,  
      url: req.originalUrl,  
      data: req.session.data  
    }  
    console.log(JSON.stringify(log, null, 2))  
   
  next()  
})  

// Base route
router.get('/main-1', function(req, res) {
  res.render('main-1')
})

// Subfolder route
router.get('/v0/main-1', function(req, res) {
  res.render('v0/main-1')
})

module.exports = router

// This code shows in the terminal what page you are on and what the previous page was.
router.use('/', (req, res, next) => {  
    res.locals.currentURL = req.originalUrl; //current screen  
    res.locals.prevURL = req.get('Referrer'); // previous screen
  
  console.log('folder : ' + res.locals.folder + ', subfolder : ' + res.locals.subfolder  );
  
    next();  
  });

  // Routing for the example journey. 
  router.post('/country-answer', function(request, response) {

    var country = request.session.data['country']
    if (country == "England"){
        response.redirect("example/complete")
    } else {
        response.redirect("example/ineligible")
    }
})


  // Add your routes here

  //PIP E2E ROUTING//

  // Scenario selection 
  router.post('/scenario-answer', function(request, response) {

    var scenario = request.session.data['scenario']
    if (scenario == "self"){
        response.redirect("e2e/sign-in/sign-in-home-pip-1-start")
    } else if (scenario == "invited"){
      response.redirect("e2e/sign-in/sign-in-home-oidv")
  }
})

  // Identity routing
  router.post('/identity-answer', function(request, response) {

    var identity = request.session.data['identity']
    if (identity == "self-journey"){
        response.redirect("e2e/home-supporting-evidence")
    } else if (identity == "invited-journey"){
      response.redirect("e2e/home-pip-2-continue")
  }
})