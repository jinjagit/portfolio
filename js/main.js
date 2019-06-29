/* 1. Pings Heroku apps on any mouseover or click if apps not pinged in last 15
   minutes. Shows 'initializing server' view while server(s) start if any
   link to a Heroku app is clicked when servers probably asleep (30+ minutes
   between pings && less than 30 seconds after last pings), and then redirects
   to clicked app link when server up (30 seconds after pings).

   2. Stores / restores scroll position.

   3. Hides element outlines, except when 'tab' key used (accessibility) */

(() => {
  const pingIfDue = () => {
    let pingDelta = (Date.now() - lastPingAll) / 1000;

    if (pingDelta > 60) { // 900 secs == 15 mins / 1800 secs == 30 mins
      if (pingDelta > 120) {
        wakeDate = Date.now();
        if (hasStorage) {
          localStorage.setItem('wakeDate', JSON.stringify(wakeDate));
        }
      }
      lastPingAll = Date.now();
      if (hasStorage) {
        localStorage.setItem('lastPingAll', JSON.stringify(lastPingAll));
      }
      pingApps();
    }
  };

  const pingApps = () => {
    const pingApp = (appKey) => {
      var p = new Ping();
      console.log(`pinging: ${appKey} url: ${apps[appKey]}`); // DEBUG
/*
      p.ping(apps[appKey], function(err, data) {
        // console.log(`pinged ${apps[appKey]} in ${data} ms`); // DEBUG
      });*/
    };

    for (var key in apps) { pingApp(key); }
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
    storeScrollPosn();
    storeScroll = false;
    content.style.display = 'none';
    navToggle.style.display = 'none';
    fixedNavLinks.style.display = 'none';
    redirect.style.display = 'block';
    redirectText.innerHTML = ` ${appKey.replace(/_/g, " ")}`;
    startRedirectCountdown(appKey);
  };

  const cancelRedirect = () => {
    if (storeScroll == false) { clearInterval(redirectCountdown) };
    redirect.style.display = 'none';
    overlay.style.zIndex = '999';
    content.style.display = 'block';
    navToggle.style.display = 'block';
    fixedNavLinks.style.display = 'block';
    restoreScrollPosn();
  };

  const restoreScrollPosn = () => {
    if (hasStorage && localStorage.getItem('scrollPosn')) {
      let scrollPosn = JSON.parse(localStorage.getItem('scrollPosn'));
      if (scrollPosn != undefined) {
        setTimeout(function(){
          window.scrollTo(0, scrollPosn);
          overlay.style.zIndex = '-1';
        }, 100);
      }
    } else {
      overlay.style.zIndex = '-1';
    }
    storeScroll = true;
  };

  const addClickToLinks = (herokuApps) => {
    for (let i = 0; i < herokuApps.length; i++) {
      herokuApps[i].addEventListener("click", function() {
        pingIfDue();
        if (((Date.now() - wakeDate) / 1000) < 30) {
          showRedirect(this.classList[0]);
        } else {
          storeScrollPosn();
          window.location.href = apps[this.classList[0]];
        }
      });
    }
  };

  const storeScrollPosn = () => {
    if (storeScroll) {
      localStorage.setItem('scrollPosn', JSON.stringify(window.pageYOffset));
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

  function handleFirstTab(e) { from: https://hackernoon.com/removing-that-ugly-focus-ring-and-keeping-it-too-6c8727fefcd2
    if (e.keyCode === 9) { // the "I am a keyboard user" key
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
    }
  }

  history.scrollRestoration = 'manual';

  const FRAME_DURATION = 1000;
  const getTime = typeof performance === 'function' ? performance.now : Date.now;
  const hasStorage = storageAvailable('localStorage');
  const isChrome = navigator.userAgent.includes('Chrom'); // Chrome || Chromium

  let apps = {
    Findr: 'https://findr-simontharby.herokuapp.com/',
    Dream_Flights: 'https://dream-flights-simontharby.herokuapp.com/',
    Social_Light: 'https://social-light-simontharby.herokuapp.com/',
    Members_Only: 'https://members-only-simontharby.herokuapp.com/',
    Blogger: 'https://blogger-simontharby.herokuapp.com/'
  };
  let lastPingAll = 0;
  let wakeDate = 0;
  let redirectInSecs = 0;
  let lastUpdate = getTime();
  let storeScroll = hasStorage ? true: false;

  let content = document.getElementById('content');
  let overlay = document.getElementById('overlay');
  let redirect = document.getElementById('redirect');
  let logo = document.getElementById('logo');
  let navToggle = document.getElementById('navToggle');
  let fixedNavLinks = document.getElementById('fixedNavLinks');
  let redirectText = document.getElementById('redirectText');
  let redirectTime = document.getElementById('redirectTime');
  let cancel = document.getElementById('cancel');
  let herokuApps = document.querySelectorAll('.heroku');

  window.addEventListener("pageshow", function(event) { // adapted from: https://stackoverflow.com/questions/43043113/how-to-force-reloading-a-page-when-using-browser-back-button
    var historyTraversal = event.persisted ||
                           (typeof window.performance != "undefined" &&
                            window.performance.navigation.type === 2);
    // Catch case: not Chrome && navigate back here without page reload
    if (historyTraversal && isChrome == false) {
      cancelRedirect();
      pingIfDue();
    }
  });

  cancel.addEventListener('click', cancelRedirect);
  logo.addEventListener('click', function() {
    if (redirect.style.display == 'block') { cancelRedirect(); }
  });
  addClickToLinks(herokuApps);
  document.body.addEventListener('click', pingIfDue);
  document.body.addEventListener('mouseover', pingIfDue);
  window.addEventListener('keydown', handleFirstTab);

  if (hasStorage) {
    document.addEventListener("scroll", storeScrollPosn);
    if (localStorage.getItem('lastPingAll')) {
      let lastPingStored = JSON.parse(localStorage.getItem('lastPingAll'));
      if (lastPingStored != undefined && lastPingStored < Date.now()) {
        lastPingAll = lastPingStored;
      }
    }
    if (localStorage.getItem('wakeDate')) {
      let wakeDateStored = JSON.parse(localStorage.getItem('wakeDate'));
      if (wakeDateStored != undefined && wakeDateStored < Date.now()) {
        wakeDate = wakeDateStored;
      }
    }
    restoreScrollPosn();
  } else {
    overlay.style.zIndex = '-1';
  }

  pingIfDue();

})();
