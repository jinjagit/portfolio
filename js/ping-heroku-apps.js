/* Pings Heroku apps when page opened or refreshed, or on any mouseover or click
   if apps not pinged in last 15 minutes. Shows notice that Heroku app servers
   may be initializing when when page opened or refreshed, or on any mouseover
   or click if apps not pinged in last 30 minutes.*/

function pingIfDue() {
  if ((new Date - last_run) / 1000 > 899) { // > 899 secs = 15 mins or more
    if ((new Date - last_run) / 1000 > 1799) { // > 1799 secs = 30 mins or more
      showNotices();
    }
    last_run = new Date;
    pingApps();
  }
}

function pingApp(index) {
  var p = new Ping();
  p.ping(apps[index], function(err, data) {
    // console.log(`pinged ${index} in ${data} ms`);
  });
}

function pingApps() {
  let test = new Date;

  for (var index in apps) {
    pingApp(`${index}`);
  }
}

function updateNotices(action) {
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
}

function animateNotices() {
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
}

function showNotices() {
  noticeTime = 31;
  lastUpdate = getTime();
  noticeAnim = setInterval(function(){ animateNotices() }, 1000);
}

let last_run = new Date;
let apps = {'Findr': 'https://findr-simontharby.herokuapp.com/',
            'Dream Flights': 'https://dream-flights-simontharby.herokuapp.com/',
            'Social Light': 'https://social-light-simontharby.herokuapp.com/',
            'Members Only': 'https://members-only-simontharby.herokuapp.com/',
            'Blogger': 'https://blogger-simontharby.herokuapp.com/'};
const FRAME_DURATION = 1000;
const getTime = typeof performance === 'function' ? performance.now : Date.now;
let noticeTime = 31;
let lastUpdate = getTime();
let notices = document.querySelectorAll('.notice');
let containers = document.querySelectorAll('.notice-container');

document.body.addEventListener('click', function() {
  pingIfDue();
});

document.body.addEventListener('mouseover', function() {
  pingIfDue();
});

updateNotices('hide');
showNotices();
pingApps();
