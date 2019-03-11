# Optimera Loader for Aardvark + PMP customers

This repo contains two file:
    example.html - a sample implementation page
    optimera-rtk.js - the javascript resource you will want to include 
    on your site.
    
## Description

The RTKOptimeraLoader will load the necessary optimera resources 
within a respected timeout settings and fire the `OptimeraReady` event
when either optimera targetting has been set for RTK or the timeout has 
reached (whichever comes sooner);

The following parameters are requried in the function:
```
	scoreFileURL (string) : The optimera score file javascript URL
	opsFileURL (string)   : The optimera ops file javascript URL
	oDv                   : The optimera div configuration mapping
	oVa					  : The initial "null" score array
	timeout				  : The time in miliseconds that we want to wait 
                            for optimera
```

When using the RTKOptimeraLoader, You can subscribe to
this event listener to know when either
	1. optimer timed out or
	2. optimera returned and RTK targetting keys have been set
look in e.detail.timedout for true/false

Example:
```
	document.addEventListener('OptimeraReady', function (e) {
		if (e.detail.timedout) {
			console.log("Optimera is ready, but we didn't get the score 
            file in time")
		} else {
			console.log("Optimera is ready and score file received within 
            our timeout")
		}
    }, false);
```

## How to use
The optimera-rtk.js file implements a singleton RTKOptimeraLoader for 
publishers that need to use Optimera with RTK's Aardvark header bidding 
adapter.

### Example Implementation:
```
    <script>
        // Location to client specific optimera score file
        var optimeraScoreFile = 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-397719490216/json/RtkIntegration.html.js';
        //Set Optimera Client ID, then ad divs on page
        var oDv = ["0", "div-0", "div-1", "div-2"];
        //Set inbound score array to NULL incase scorefile does not return
        var oVa = { "div-0": ["NULL"], "div-1": ["NULL"], "div-2": ["NULL"] };
        /* Call The RTKOptimeraLoader.load function passing in the above values
           in addition to a desired timeout in miliseconds */
        RTKOptimeraLoader.load(optimeraScoreFile, null, oDv, oVa, 2000);
    <script>
```
