/* Pings Heroku apps on any mouseover or click if apps not pinged in last 15
   minutes. Shows 'initializing redirect' view while server(s) start if any
   link to a Heroku app is clicked when servers asleep (30+ minutes without
   ping && less than 30 seconds after new pings caused by mouse activity). */

(() => {
  const pingIfDue = () => {
    if ((Date.now() - lastPingAll) / 1000 > 899) { // > 899 secs = 15 mins or more
      if ((Date.now() - lastPingAll) / 1000 > 1799) { // > 1799 secs = 30 mins or more
        showNotices();
      }
      lastPingAll = Date.now();
      if (storageAvailable('localStorage')) {
        localStorage.setItem('lastPingAll', JSON.stringify(lastPingAll));
      }
      pingApps();
    }
  };

  const pingApp = (app) => {
    var p = new Ping();

    console.log(`pinging: ${app.name}`);

    p.ping(app.url, function(err, data) {
      // console.log(`pinged ${app.id} in ${data} ms`); // DEBUG
    });
  };

  const pingApps = () => {
    for (let i = 0; i < apps.length; i++) {
      pingApp(apps[i]);
    }
  };

  const updateNotices = (action) => {
    for (i = 0; i < notices.length; i++) {
      if (action == 'hide') {
        notices[i].style.display = 'none';
        containers[i].style.display = 'none';
      } else if (action == 'orange') {
        notices[i].style.color = '#cc6200';
        containers[i].style.backgroundColor = '#fcf3ea';
        containers[i].style.borderColor = '#cc6200';
      } else if (action == 'green') {
        notices[i].style.color = '#004d40';
        notices[i].innerHTML = `Application server ACTIVE.`;
        containers[i].style.backgroundColor = '#f7fffd';
        containers[i].style.borderColor = '#004d40';
      } else if (action == 'countdown') {
        notices[i].innerHTML = `This app's server is initializing and may be unresponsive for up to ${noticeTime} seconds.`;
        notices[i].style.display = 'block';
        containers[i].style.display = 'block';
      }
    }
  };

  const animateNotices = () => {
    const now = getTime();
    const delta = (now - lastUpdate) / FRAME_DURATION;
    noticeTime -= Math.round(delta);
    updateNotices('orange');
    lastUpdate = now;
    if (noticeTime < -5) {
      updateNotices('hide');
      clearInterval(noticeAnim);
    } else if (noticeTime <= 0) {
      updateNotices('green');
    } else {
      updateNotices('countdown');
    }
  };

  const showNotices = () => {
    noticeTime = 31;
    lastUpdate = getTime();
    noticeAnim = setInterval(function(){ animateNotices() }, 1000);
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

  let lastPingAll = 0;
  let apps = [
    { name: 'findr', url: 'https://findr-simontharby.herokuapp.com/' },
    { name: 'Dream Flights', url: 'https://dream-flights-simontharby.herokuapp.com/' },
    { name: 'Social Light', url: 'https://social-light-simontharby.herokuapp.com/' },
    { name: 'Members Only', url: 'https://members-only-simontharby.herokuapp.com/' },
    { name: 'Blogger', url: 'https://blogger-simontharby.herokuapp.com/' }
  ];
  const FRAME_DURATION = 1000;
  const getTime = typeof performance === 'function' ? performance.now : Date.now;
  let noticeTime = 31;
  let lastUpdate = getTime();
  let notices = document.querySelectorAll('.notice');
  let containers = document.querySelectorAll('.notice-container');

  document.body.addEventListener('click', pingIfDue);
  document.body.addEventListener('mouseover', pingIfDue);

  if (storageAvailable('localStorage')) {
    if(localStorage.getItem('lastPingAll')) {
      lastPingStored = JSON.parse(localStorage.getItem('lastPingAll'));
      if (lastPingStored != undefined && lastPingStored < Date.now()) {
        lastPingAll = lastPingStored;
      }
    }
  }

  updateNotices('hide'); // ? remove when new initializing view created ?
  pingIfDue();

  // console.log(storageAvailable('localStorage')); // DEBUG

})();
