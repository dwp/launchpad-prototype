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
      response.redirect("e2e/sign-in/sign-in-home-pip-2-continue")
  }
})

  // Identity routing
  router.post('/identity-answer', function(request, response) {

    var scenario = request.session.data['scenario'];
    if (scenario === "self"){
        response.redirect("e2e/home-supporting-evidence")
    } else if (scenario === "invited"){
      response.redirect("e2e/home-pip-2-continue")
  }
})

  // IDV
  router.post('/idv', function(request, response) {

    var scenario = request.session.data['scenario'];
    if (scenario === "self"){
        response.redirect("e2e/oidv/confirm-your-identity-start")
    } else if (scenario === "invited"){
      response.redirect("e2e/home-supporting-evidence")
  }
})

// HIG end

router.post('/hig-submitted', function(request, response) {

  var scenario = request.session.data['scenario'];
  if (scenario === "self"){
      response.redirect("e2e/health-form/hig-submitted-idv-no")
  } else if (scenario === "invited"){
    response.redirect("e2e/health-form/hig-submitted-idv-complete")
}
})



//
//
// ONE LOGIN
//
//

//Set user scenario
router.post('/logInScenario', function (req, res) {
  //Store response
  var logInScenario = req.session.data['logInScenario'];

  if (logInScenario == "Invited digital user"){
    res.redirect("/ol/invite-email");
  } else if (logInScenario == "OIDV successful"){
    res.redirect("/ol/oidv");
  } else if (logInScenario == "OIDV failed"){
    res.redirect("/ol/oidv");
  } else if (logInScenario == "Email updated"){
    res.redirect("/ol/pip-home");
  } else if (logInScenario == "Telephony"){
    res.redirect("/ol/oidv");
  }
  //Redirect
  else res.redirect('/ol/pip-govuk');
});

//Set variant
router.post('/protoVariant', function (req, res) {
  //Store response
  //var protoVariant = req.session.data['protoVariant'];
  var logInScenario = req.session.data['logInScenario'];
  if (logInScenario == "Invited digital user"){
    res.redirect("/ol/invite-email");
  } 
  //Redirect
  else res.redirect('/ol/pip-govuk');
});

//Set OIDV scenario
router.post('/oidvScenario', function (req, res) {

  var oidvScenario = req.session.data['oidvScenario'];
  //Store response
    if (oidvScenario == "PIP Home"){
    res.redirect("/ol/pip-home-oidv");
  } 
  else res.redirect('/ol/hig-submitted');
});

router.post('/eligible', function(request, response) {
  var protoVariant = request.session.data['protoVariant'];
  response.redirect('/ol/ol-landing');

});

 //Redirect from email screen based on scenario selected
 router.post('/email',function(request, response) {
  var logInScenario = request.session.data['logInScenario'];
  if (logInScenario == "Returning DTH user"){
      response.redirect("/ol/there-is-a-problem-registering-you");
  } else if (logInScenario == "Unmatched NINO"){
      response.redirect("/ol/there-is-a-problem-registering-you");
  } else if (logInScenario == "Unmatched email"){
      response.redirect("/ol/there-is-a-problem-registering-you");
  }
  else if (logInScenario == "New One Login user during migration") {
      response.redirect("/ol/eligible");
  } else if (logInScenario == "Post migration journey") {
      response.redirect("/ol/eligible");
  } else if (logInScenario == "Invited digital user") {
      response.redirect("/ol/ol-landing");
  } else if (logInScenario == "Not registered") {
      response.redirect("/ol/eligible");
  } else if (logInScenario == "Returning One Login user during migration") {
      response.redirect("/ol/there-is-a-problem-registering-you");
  }
  })//Invited digital userNew One Login user during migrationReturning One Login user during migration

    //Redirect from state pension screen based on scenario selected
 router.post('/statePension',function(request, response) {
  var logInScenario = request.session.data['logInScenario'];
  var protoVariant = request.session.data['protoVariant'];
  if (logInScenario == "Returning DTH user"){
      response.redirect("/ol/email");
  } else if (logInScenario == "Unmatched NINO" || logInScenario == "Unmatched email"){
      response.redirect("/ol/email");
  } else if (logInScenario == "New One Login user during migration") {
      response.redirect("/ol/email");
  } else if (logInScenario == "Not registered") {
      response.redirect("/ol/email");
  } else if (logInScenario == "Returning One Login user during migration") {
      response.redirect("/ol/email");
  } else if (logInScenario == "Post migration journey") {
    response.redirect("/ol/email");
} 
  })

  //Redirect from email screen based on scenario selected
 router.post('/returningEmail',function(request, response) {
  var logInScenario = request.session.data['logInScenario'];
  var protoVariant = request.session.data['protoVariant'];
  if (logInScenario == "Returning DTH user"){
      response.redirect("/ol/dth-explainer");
  }  else if (logInScenario == "Unmatched NINO" || logInScenario == "Unmatched email"){
      response.redirect("/ol/dth-explainer");
  } else if (logInScenario == "New One Login user during migration") {
      response.redirect("/ol/ol-landing");
  } else if (logInScenario == "Returning One Login user during migration") {
    response.redirect("/ol/ol-landing");
  } else if (logInScenario == "Invited digital user") {
    response.redirect("/ol/ol-landing");
  } else if (logInScenario == "Telephony") {
    response.redirect("/ol/ol-landing");
  } else if (logInScenario == "Not registered") {
    response.redirect("/ol/we-cannot-sign-you-in");
  } 
  })

//Redirect from One Login password screen based on scenario
 router.post('/ol-password',function(request, response) {
  var logInScenario = request.session.data['logInScenario'];
  if (logInScenario == "Unmatched NINO" || logInScenario == "Unmatched email" || logInScenario == "Returning DTH user"){
      response.redirect("/ol/name");
  } else response.redirect('/ol/pip-home');
  })

  //Redirect from One Login posctcode screen based on scenario
  router.post('/postcode-answer',function(request, response) {
  var logInScenario = request.session.data['logInScenario'];
  if (logInScenario == "Unmatched NINO"){
      response.redirect("/ol/unmatched");
  }  else if (logInScenario == "Unmatched email"){
      response.redirect("/ol/unmatched");
  } else if (logInScenario == "Returning DTH user"){
      response.redirect("/ol/pip-home");
  };
  })