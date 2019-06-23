/* Pings Heroku apps on any mouseover or click if apps not pinged in last 15
   minutes. Shows 'initializing server' view while server(s) start if any
   link to a Heroku app is clicked when servers probably asleep (30+ minutes
   between pings && less than 30 seconds after last pings), and then redirects
   to clicked app link when server up (30 seconds after pings). */

(() => {
  const pingIfDue = () => {
    let pingDelta = (Date.now() - lastPingAll) / 1000;

    if (pingDelta > 900) { // 900 secs == 15 mins
      pingDelta > 1800 ? downtime = pingDelta - 1800 : downtime = 0; // 1800 secs == 30 mins
      lastPingAll = Date.now();
      if (storageAvailable('localStorage')) {
        localStorage.setItem('lastPingAll', JSON.stringify(lastPingAll));
      }
      pingApps();
    }
  };

  const pingApp = (appKey) => {
    var p = new Ping();

    // console.log(`pinging: ${appKey} url: ${apps[appKey]}`); // DEBUG

    p.ping(apps[appKey], function(err, data) {
      // console.log(`pinged ${appKey} in ${data} ms`); // DEBUG
    });
  };

  const pingApps = () => {
    for (var key in apps) {
      pingApp(key);
    }
  };

  const redirectCountdownTick = (appKey) => {
    const now = getTime();
    const delta = (now - lastUpdate) / FRAME_DURATION;
    redirectInSecs -= Math.round(delta);
    lastUpdate = now;
    if (redirectInSecs < 0) {
      clearInterval(redirectCountdown);
      redirect.style.display = 'none';
      window.location.href = apps[appKey];
    } else {
      redirectTime.innerHTML = `${redirectInSecs}`;
    }
  };

  const startRedirectCountdown = (appKey) => {
    redirectInSecs = Math.round(30 - ((Date.now() - lastPingAll) / 1000));
    redirectTime.innerHTML = `${redirectInSecs}`;
    lastUpdate = getTime();
    redirectCountdown = setInterval(function() {
      redirectCountdownTick(appKey);
    }, 1000);
  };

  const showRedirect = (appKey) => {
    content.style.display = 'none';
    //navMenu.style.display = 'none';
    redirect.style.display = 'block';
    redirectText.innerHTML = ` ${appKey.replace(/_/g, " ")}`;
    startRedirectCountdown(appKey);
  };

  const cancelRedirect = () => {
    clearInterval(redirectCountdown);
    redirect.style.display = 'none';
    content.style.display = 'block';
    //navMenu.style.display = 'block';
    if (storageAvailable('localStorage')) { restoreScrollPosn(); }
  };

  const restoreScrollPosn = () => {
    if (localStorage.getItem('scrollPosn')) {
      let scrollPosn = JSON.parse(localStorage.getItem('scrollPosn'));
      if (scrollPosn != undefined && scrollPosn > 0) {
        console.log(`scrollPosn: ${scrollPosn}`);
        window.scrollTo(0, scrollPosn);
        localStorage.setItem('scrollPosn', JSON.stringify(0));
      }
    }
  };

  const addClickToLinks = (herokuApps) => {
    for (let i = 0; i < herokuApps.length; i++) {
      herokuApps[i].addEventListener("click", function() {
        pingIfDue();
        if (((Date.now() - lastPingAll) / 1000) < 30 && downtime > 0) {
          if (storageAvailable('localStorage')) {
            localStorage.setItem('scrollPosn', JSON.stringify(window.pageYOffset));
          }
          showRedirect(this.classList[0]);
        } else {
          window.location.href = apps[this.classList[0]];
        }
      });
    }
  };

  const storageAvailable = (type) => { // from: https://developer.mozilla.org
    var storage;
    try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return e instanceof DOMException && (
        e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        (storage && storage.length !== 0);
    }
  };

  window.addEventListener("pageshow", function(event) { // from: https://stackoverflow.com/questions/43043113/how-to-force-reloading-a-page-when-using-browser-back-button
    var historyTraversal = event.persisted ||
                           (typeof window.performance != "undefined" &&
                            window.performance.navigation.type === 2);
    if (historyTraversal) { window.location.reload(); }
  });

  let content = document.getElementById('content');
  let redirect = document.getElementById('redirect');
  redirect.style.display = 'none';
  content.style.display = 'block';

  let lastPingAll = 0;
  let apps = {
    Findr: 'https://findr-simontharby.herokuapp.com/',
    Dream_Flights: 'https://dream-flights-simontharby.herokuapp.com/',
    Social_Light: 'https://social-light-simontharby.herokuapp.com/',
    Members_Only: 'https://members-only-simontharby.herokuapp.com/',
    Blogger: 'https://blogger-simontharby.herokuapp.com/'
  };
  const FRAME_DURATION = 1000;
  const getTime = typeof performance === 'function' ? performance.now : Date.now;
  let redirectInSecs = 0; // set to: 0
  let downtime = 0;
  let lastUpdate = getTime();
  //let navMenu = document.getElementById('navMenu');
  let redirectText = document.getElementById('redirectText');
  let redirectTime = document.getElementById('redirectTime');
  let cancel = document.getElementById('cancel');
  let herokuApps = document.querySelectorAll('.heroku');

  cancel.addEventListener('click', cancelRedirect);
  addClickToLinks(herokuApps);
  //navMenu.style.display = 'block';

  document.body.addEventListener('click', pingIfDue);
  document.body.addEventListener('mouseover', pingIfDue);

  if (storageAvailable('localStorage')) {
    if (localStorage.getItem('lastPingAll')) {
      let lastPingStored = JSON.parse(localStorage.getItem('lastPingAll'));
      if (lastPingStored != undefined && lastPingStored < Date.now()) {
        lastPingAll = lastPingStored;
      }
    }
    restoreScrollPosn();
  }

  pingIfDue();

})();
