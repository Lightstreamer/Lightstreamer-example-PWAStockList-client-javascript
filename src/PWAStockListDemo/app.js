class App {

  constructor() {
    this.divInstall = document.getElementById('installContainer')
    this.butInstall = document.getElementById('butInstall')
    window.addEventListener('beforeinstallprompt', (event) => {
      this.evtBeforeInstallPrompt(event)
    })
    butInstall.addEventListener('click', () => {
      this.evtInstallPressed()
    })
    window.addEventListener('offline', () => {
      this.evtOffline()
    })
    /* Only register a service worker if it's supported */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js');
    }
  }

  start() {
    this.goto1()
  }

  evtHttp() {
    console.log('event: page is served over http', this.state)
    if (this.state == 1) {
      this.goto3()
    }
  }

  evtHttps() {
    console.log('event: page is served over https', this.state)
    if (this.state == 1) {
      this.goto2()
    }
  }

  evtOnline() {
    console.log('event: browser is online', this.state)
    if (this.state == 2) {
      this.goto4()
    }
  }

  evtBeforeInstallPrompt(event) {
    console.log('event: beforeinstallprompt', this.state)
    if (this.state == 4) {
      this.goto6(event)
    } else if (this.state == 8) {
      this.goto6(event)
    }
  }

  evtInstallPressed() {
    console.log('event: Install button pressed', this.state)
    if (this.state == 6) {
      this.goto7()
    } else if (this.state == 8) {
      this.goto7()
    }
  }

  evtCancelPressed() {
    console.log('event: Cancel button pressed', this.state)
    if (this.state == 7) {
      this.goto8()
    }
  }

  evtOKPressed() {
    console.log('event: OK button pressed', this.state)
    if (this.state == 7) {
      this.goto9()
    }
  }

  evtOffline() {
    console.log('event: browser is offline', this.state)
    this.goto5()
  }

  goto1() {
    this.state = 1
    console.log('action: check https', this.state)
    if (window.location.protocol === 'http:') {
      this.evtHttp()
    } else {
      this.evtHttps()
    }
  }

  goto2() {
    this.state = 2
    console.log('action: check online status', this.state)
    if (navigator.onLine) {
      this.evtOnline()
    } else {
      this.evtOffline()
    }
  }

  goto3() {
    this.state = 3
    console.log('action: go to not-secure.html', this.state)
    location = "not-secure.html"
  }

  goto4() {
    this.state = 4
    console.log('action: connect to Lightstreamer', this.state)
    
    var protocolToUse = document.location.protocol != "file:" ? document.location.protocol : "http:";
    var portToUse = document.location.protocol == "https:" ? "443" : "80";

    var lsClient = new LS.LightstreamerClient(protocolToUse+"//push.lightstreamer.com:"+portToUse,"DEMO");
    lsClient.addListener(new LS.StatusWidget("left", "0px", true));
    lsClient.connect();

    var stocksGrid = new LS.StaticGrid("stocks",true);
    stocksGrid.setAutoCleanBehavior(true,false);
    stocksGrid.addListener({
      onVisualUpdate: function(key,info) {
        if (info == null) {
          //cleaning
          return;
        }
        var cold = (key.substring(4) % 2 == 1) ? "#eeeeee" : "#ddddee";
        info.setAttribute("yellow", cold, "backgroundColor");
      }
    });
  
    var stockSubscription = new LS.Subscription("MERGE",stocksGrid.extractItemList(),stocksGrid.extractFieldList());
    stockSubscription.addListener(stocksGrid);
    stockSubscription.setDataAdapter("QUOTE_ADAPTER");
    stockSubscription.setRequestedSnapshot("yes");
    lsClient.subscribe(stockSubscription);
  }

  goto5() {
    this.state = 5
    console.log('action: go to offline.html', this.state)
    location = "offline.html"
  }

  goto6(event) {
    this.state = 6
    console.log('action: save beforeinstallprompt event', this.state, event);
    // Stash the event so it can be triggered later.
    this.deferredPrompt = event;
    // Remove the 'hidden' class from the install button container
    this.divInstall.classList.toggle('hidden', false);
  }

  async goto7() {
    this.state = 7
    console.log('action: prompt user', this.state)
    const promptEvent = this.deferredPrompt;
    // Show the install prompt.
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    console.log('userChoice', result);
    if (result.outcome == 'accepted') {
      this.evtOKPressed()
    } else {
      this.evtCancelPressed()
    }
  }

  goto8() {
    this.state = 8
    console.log('action: installation cancelled', this.state)
  }

  goto9() {
    this.state = 9
    console.log('action: app installed', this.state)
    // Hide install button
    this.divInstall.classList.toggle('hidden', true);
  }
}