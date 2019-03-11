/* 
The RTKOptimeraLoader will load the necessary optimera resources
within a respected timeout settings and fire the `OptimeraReady` event
when either optimera targetting has been set for RTK or the timeout has
reached (whichever comes sooner);

The following parameters are requried in the load function:
```
	scoreFileURL (string) : The optimera score file javascript URL
	opsFileURL (string)   : The optimera ops file javascript URL
	oDv                   : The optimera div configuration mapping
	oVa					  : The initial "null" score array
	timeout				  : The time in miliseconds that we want to wait
                            for optimera
```
*/

var RTKOptimeraLoader = new function() {

    this.load = function (scoreFileURL = null, opsFileURL = null, oDv, oVa, timeout = 500) {

        // Optimera constants expected by optimera
        window.top.optimeraHost = window.location.host;
        window.top.optimeraPathName = window.location.pathname;
        window.top.oVa = oVa;
        window.top.oDv = oDv;
        
        // Temporary event listener to ensure we only fire OptimeraReadyEvent one time
        window.top.document.addEventListener('rtkoptimera', function (e) {
            window.top.document.dispatchEvent(new CustomEvent('OptimeraReady', { detail: { timedout: e.detail.timedout } }))
            // remove this event listener as we just want to react to it on the first call
            e.target.removeEventListener(e.type, arguments.callee);

        }, false);

    //Define our script loaded callback function so we know definitively when optimera scripts returned
    function optimeraCallback(path, success, isScoreFile) {
            if (success && isScoreFile) {
                console.log("Optimera Score File Script Loaded");
                lowestScore = window.top.oVa['ls'][0] || false;
                if (lowestScore) {
                    // Round down to the nearest 10 as RTK only supports 10 optimera categories.
                    var RTKOptimeraValue = "optimera" + Math.round(lowestScore / 10) * 10;
                    window.top.rtkcategories = window.top.rtkcategories || [];
                    window.top.rtkcategories.push(RTKOptimeraValue);
                    console.log("Added optimera to RTK categories as " + RTKOptimeraValue);
                    window.top.document.dispatchEvent(new CustomEvent('rtkoptimera', { detail: { timedout: false } }))

                }

            } else if (success && !isScoreFile) {
                console.log("Optimera Ops Script Loaded");
            }


        }
        
     // Load a javascript function with callbacks so we aren't racing
     function loadOptimeraResources (path, isScoreFile=false, timeout=500) {

            var done = false;
            var scr = window.top.document.createElement('script');

            scr.onload = handleLoad;
            scr.onreadystatechange = handleReadyStateChange;
            scr.onerror = handleError;
            scr.src = path;
            scr.async = true;
            window.top.document.head.appendChild(scr);

            if (isScoreFile) {
                // Fire the rtkOptimeraEvent after x miliseconds to handle a graceful timeout
                setTimeout(function () {
                    window.top.document.dispatchEvent(new CustomEvent('rtkoptimera', { detail: { timedout: true } }))
                }, timeout);
            }

            function handleLoad() {
                if (!done) {
                    done = true;
                    console.log("Handled Optimera Load")
                    optimeraCallback(path, true, isScoreFile);
                }
            }

            function handleReadyStateChange() {
                var state;

                if (!done) {
                    state = scr.readyState;
                    if (state === "complete") {
                        handleLoad();
                    }
                }
            }
            function handleError() {
                if (!done) {
                    done = true;
                    console.log("Error Loading Optimera Script")
                }
            }
        }

        // load our optimera scripts 
        (scoreFileURL) ? loadOptimeraResources(scoreFileURL, true, timeout) : console.log("No score file passed into loader, this might break your Optimera Integration.");
        (opsFileURL) ? loadOptimeraResources(opsFileURL, false, timeout) : console.log("No OPS file passed in, skipping.");


    }
}