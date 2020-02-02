/* 1. Creates portfolio items DOM and heroku app link event listeners, using data
   from items[...] array.

   2. Pings Heroku apps on any mouseover or click if apps not pinged in last 15
   minutes. Shows 'initializing server' view while server(s) start if any
   link to a Heroku app is clicked when servers probably asleep (30+ minutes
   between pings && less than 30 seconds after last pings), and then redirects
   to clicked app link when server up (30 seconds after pings).

   3. Stores / restores scroll position.

   4. Hides element outlines, except when 'tab' key used (accessibility) */

(() => {
  const items = [
    {name: "To-do", heroku: false, video: false,
      url: "https://to-do.simontharby.com/",
      gHub: "https://github.com/jinjagit/todo",
      description: "A basic to-do app, with a mobile-focused, clean design. Written in pure JavaScript, with an emphasis on separation of app logic from DOM manipulation (using a modular file structure, bundled with Webpack). View to-do items by project, or view all to-do items from all projects. Click / tap a to-do item to view / edit details. To-do items are ordered firstly by priority, and secondly by date of creation."
    },
    {name: "Findr", heroku: true, video: false,
      url: "https://findr-simontharby.herokuapp.com/",
      gHub: "https://github.com/jinjagit/flickr-api",
      description: "Interact with the Flickr-API via a Rails application. Search for user by user ID or username. Display user information and photos. Browse all photos or by album. Includes error handling of Flickr-API errors (on form submission). Includes suite of Rspec tests, using VCR gem for all tests which involve an expected response from the Flickr API. Mobile / desktop repsonsive layout."
    },
    {name: "Dream Flights", heroku: true, video: false,
      url: "https://dream-flights-simontharby.herokuapp.com/",
      gHub: "https://github.com/jinjagit/flight-booker",
      description: "A Rails project to explore more advanced forms, and specifically forms which submit nested attributes. Search for flights between various destinations and create flight bookings which include basic passenger details."
    },
    {name: "Social Light", heroku: true, video: false,
      url: "https://social-light-simontharby.herokuapp.com/",
      gHub: "https://github.com/jinjagit/social_light",
      description: "A proof-of-concept Rails application that makes use of a through-table (Attendances) and the appropriate related Active Record associations (User <=> Attendance(s) <=> Event). Create events which include a list of attendees (invited users), and filter events by date (future vs. past) on the User page (named: 'events'). Includes suite of Rspec tests."
    },
    {name: "Members Only", heroku: true, video: false,
      url: "https://members-only-simontharby.herokuapp.com/",
      gHub: "https://github.com/jinjagit/members_only",
      description: "Practice in the creation / usage of a robust authentication system for the Rails framework. The key concepts are the use of a secure password digest method, a browser cookie 'remember user login' method (with secure remember token digest), and limiting access to certain functions (esp: viewing post author names) to signed-in users only."
    },
    {name: "Blogger", heroku: true, video: false,
      url: "https://blogger-simontharby.herokuapp.com/",
      gHub: "https://github.com/jinjagit/blogger",
      description: "A basic blogging / forum Rails application. A fully featured web application, including authentication (admin v regular users), associations between data models (including through-tables), and a simple and clear interface."
    },
    {name: "Ruby Chess", heroku: false, video: true,
      url: "https://youtu.be/9CCH4cYogmI",
      gHub: "https://github.com/jinjagit/chess",
      description: "A graphical chess interface, written in pure Ruby and making use of the Ruby2D gem. All rules of chess are enforced, including all legal moves, forced draws, draw through repetition, etc. The GUI is intuitive and offers many optional aids to the user, such as highlighting of legal moves, algebraic notation and the ability to review previous moves. Games can be saved and loaded, and saved incomplete games can be continued."
    },
    {name: "Calculator", heroku: false, video: false,
      url: "https://calculator.simontharby.com/",
      gHub: "https://github.com/jinjagit/calculator",
      description: "A mobile focused, minimal, responsive design, with desktop default layout (scaled relative to screen size and responsive under certain conditions), written in pure JavaScript. The calculator offers parenthesized expressions and exponentiation, as well as the normal basic operations. Various error messages are displayed when appropriate. Scientific notation is used to enable display of very large / small values. The overall design is clean and user-friendly."
    },
    {name: "Duty Timer", heroku: false, video: false,
      url: "https://duty-timer.simontharby.com/",
      gHub: "https://github.com/jinjagit/pomodoro",
      description: "A pomodoro clock (work / rest timer), implemented in 90% JavaScript, to produce an elegant and intuitive design which uses color prompts and simple controls to provide a pleasant user experience. Includes an optional audio alarm function, and progress bar."
    }
  ];

  const portfolio = () => {
    const herokuEvent = (element) => {
      const findByTag = (tag) => {
        for (i = 0; i < items.length; i++) {
          if ((items[i].name == tag) || (items[i].name == tag.replace("-", " "))) {
            return i;
          };
        };
      };

      element.addEventListener("click", function() {
        let itemsIndex = findByTag(this.classList[0]);
        pingIfDue();
        if (((Date.now() - wakeDate) / 1000) < 30) {
          showRedirect(itemsIndex);
        } else {
          storeScrollPosn();
          window.location.href = items[itemsIndex].url;
        }
      });
    };

    let divItems = document.getElementById('portfolio-items');

    for (i = 0; i < items.length; i++) {
      let tag = items[i].name.replace(" ", "-");

      let divA = document.createElement("div");
      divA.classList.add("d-block", "d-md-none");
      divA.style.height = "30px";
      divItems.appendChild(divA);
      let h2A = document.createElement("h2");
      h2A.classList.add("d-block", "d-md-none");
      h2A.style.textAlign = "center";
      h2A.innerHTML = `${items[i].name}`;
      divItems.appendChild(h2A);

      let divB = document.createElement("div");
      divB.classList.add("row");
      divItems.appendChild(divB);
      let divBa = document.createElement("div");
      divBa.classList.add("col-md-4", "mb-4");
      divB.appendChild(divBa);
      let aA = document.createElement("a");
      divBa.appendChild(aA);

      // image carousel ...
      let divaAA = document.createElement("div");
      divaAA.id = tag;
      divaAA.setAttribute("data-ride", "carousel");
      aA.appendChild(divaAA);
      let ulA = document.createElement("ul");
      ulA.classList.add("carousel-indicators");
      divaAA.appendChild(ulA);
      for (j = 0; j < 3; j++) {
        let liX = document.createElement("li");
        liX.setAttribute("data-target", `#${tag}`);
        liX.setAttribute("data-slide-to", `${j}`);
        if (j == 0) liX.classList.add("active");
        ulA.appendChild(liX);
      };
      let divaAAa = document.createElement("div");
      divaAAa.classList.add("carousel-inner");
      divaAA.appendChild(divaAAa);
      for (j = 0; j < 3; j++) {
        let divX = document.createElement("div");
        divX.classList.add("carousel-item");
        if (j == 0) divX.classList.add("active");
        divaAAa.appendChild(divX);
        let imgX = document.createElement("img");
        imgX.src = `img/${tag}${j+1}.jpg`;
        imgX.alt = `${tag}${j+1}.jpg`;
        divX.appendChild(imgX);
      };
      // end of image carousel

      let divBb = document.createElement("div");
      divBb.classList.add("col-md-8", "mb-4");
      divB.appendChild(divBb);
      let h2B = document.createElement("h2");
      h2B.classList.add("d-none", "d-md-block");
      h2B.innerHTML = `${items[i].name}`;
      divBb.appendChild(h2B);
      let p = document.createElement("p");
      p.innerHTML = `${items[i].description}`;
      divBb.appendChild(p);
      let divBbA = document.createElement("div");
      divBbA.classList.add("d-none", "d-md-block");
      divBbA.style.height = "15px";
      divBb.appendChild(divBbA);
      let divBbB = document.createElement("div");
      divBbB.classList.add("row");
      divBb.appendChild(divBbB);
      let divBbBA = document.createElement("div");
      divBbBA.classList.add("col-md-6", "mb-2");
      divBbB.appendChild(divBbBA);
      let aB = document.createElement("a");
      divBbBA.appendChild(aB);
      let imgA = document.createElement("img");
      imgA.src = "img/website-btn.png";
      imgA.alt = "website-btn.png";
      aB.appendChild(imgA);
      let divBbBB = document.createElement("div");
      divBbBB.classList.add("col-md-6", "mb-2");
      divBbB.appendChild(divBbBB);
      let aC = document.createElement("a");
      aC.href = items[i].gHub;
      divBbBB.appendChild(aC);
      let imgB = document.createElement("img");
      imgB.classList.add("butn");
      imgB.src = "img/code-btn.png";
      imgB.alt = "code-btn.png";
      aC.appendChild(imgB);

      if (items[i].heroku == true) {
        aA.href = "javascript:;"
        aB.href = "javascript:;"
        divaAA.classList.add(tag);
        imgA.classList.add(tag);
        herokuEvent(divaAA);
        herokuEvent(imgA);
      } else {
        aA.href = items[i].url;
        aB.href = items[i].url;
      };

      divaAA.classList.add("carousel", "slide", "carousel-fade");
      imgA.classList.add("butn");
    };

  };


  const pingIfDue = () => {
    let pingDelta = (Date.now() - lastPingAll) / 1000;

    if (pingDelta > 900) { // 900 secs == 15 mins / 1800 secs == 30 mins
      if (pingDelta > 1800) {
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
    const pingApp = (itemsIndex) => {
      var p = new Ping();
      // console.log(`pinging: ${items[itemsIndex].name} url: ${items[itemsIndex].url}`); // DEBUG

      p.ping(items[itemsIndex].url, function(err, data) {
        // console.log(`pinged ${items[itemsIndex].name} in ${data} ms`); // DEBUG
      });
    };

    for (i = 0; i < items.length; i++) {
      if (items[i].heroku == true) pingApp(i);
    };
  };

  const redirectCountdownTick = (itemsIndex) => {
    const now = getTime();
    const delta = (now - lastUpdate) / FRAME_DURATION;
    redirectInSecs -= Math.round(delta);
    lastUpdate = now;
    if (redirectInSecs < 0) {
      clearInterval(redirectCountdown);
      redirect.style.display = 'none';
      window.location.href = items[itemsIndex].url;
    } else {
      redirectTime.innerHTML = `${redirectInSecs}`;
    }
  };

  const startRedirectCountdown = (itemsIndex) => {
    redirectInSecs = Math.round(30 - ((Date.now() - lastPingAll) / 1000));
    redirectTime.innerHTML = `${redirectInSecs}`;
    lastUpdate = getTime();
    redirectCountdown = setInterval(function() {
      redirectCountdownTick(itemsIndex);
    }, 1000);
  };

  const showRedirect = (itemsIndex) => {
    storeScrollPosn();
    redirecting = true;
    content.style.display = 'none';
    navToggle.style.display = 'none';
    fixedNavLinks.style.display = 'none';
    redirect.style.display = 'block';
    redirectText.innerHTML = ` ${items[itemsIndex].name}`;
    startRedirectCountdown(itemsIndex);
  };

  const cancelRedirect = () => {
    if (redirecting == true) { clearInterval(redirectCountdown) };
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
    redirecting = false;
  };

  const storeScrollPosn = () => {
    if (redirecting == false) {
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

  let lastPingAll = 0;
  let wakeDate = 0;
  let redirectInSecs = 0;
  let lastUpdate = getTime();
  let redirecting = false;

  let content = document.getElementById('content');
  let overlay = document.getElementById('overlay');
  let redirect = document.getElementById('redirect');
  let logo = document.getElementById('logo');
  let navToggle = document.getElementById('navToggle');
  let fixedNavLinks = document.getElementById('fixedNavLinks');
  let redirectText = document.getElementById('redirectText');
  let redirectTime = document.getElementById('redirectTime');
  let cancel = document.getElementById('cancel');

  window.addEventListener("pageshow", function(event) { // adapted from: https://stackoverflow.com/questions/43043113/how-to-force-reloading-a-page-when-using-browser-back-button
    var historyTraversal = event.persisted ||
                           (typeof window.performance != "undefined" &&
                            window.performance.navigation.type === 2);
    // Catch case: not Chrome && navigate back here without page reload
    if (historyTraversal && isChrome == false) {
      if ((hasStorage && Date.now() > (lastPingAll + 30000)) || (hasStorage == false)) {
        cancelRedirect();
        pingIfDue();
      }
    }
  });

  portfolio();

  cancel.addEventListener('click', cancelRedirect);
  logo.addEventListener('click', function() {
    if (redirect.style.display == 'block') { cancelRedirect(); }
  });
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
