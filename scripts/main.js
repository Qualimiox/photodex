$(function () {
  const $window = $(window);
  const $body = $(document.body);
  const $main = $('#main');
  const $gallery = $('#gallery');
  const $closeButton = $('#close-button');

  const snaps = [];
  let _currentSnap = null;

  const keysDown = {};
  let scrollTop;
  let scrollDisabled = false;

  const GENERATIONS = Object.freeze([
    { region: 'Kanto', start: 1, end: 151 },
    { region: 'Johto', start: 152, end: 251 },
    { region: 'Hoenn', start: 252, end: 386 }
  ]);

  const UNOBTAINABLE = Object.freeze([
    // Unreleased Mythical
    385, 386,
    // Babies
    172, 173, 174, 175, 236, 238, 239, 240, 298, 360,
    // Evolution items
    182, 186, 192, 199, 208, 212, 230, 233,
    // Eeveelotuions
    196, 197,
    // Unreleased Johto
    235,
    // Hoenn withheld evolutions
    254, 257, 260, 266, 267, 268, 269, 282, 289, 295,
    308, 321, 330, 334, 350, 373,
    // Unreleased Hoenn
    290, 291, 292, 327, 352, 366, 367, 368
  ]);

  $.get('snaps/snaps.json')
    .done(function (data) {
      for (var i = 0; i < data.length; i++) {
        snaps.push(data[i].substring(0, 3));
      }
      $body.removeClass('loading');
      loadSnaps();
    })
    .fail(function () {
      alert('Failed to load Photódex information!');
    });

  function loadSnaps() {
    $('#snapped-count').text(snaps.length);

    const highestSnap = parseInt(snaps[snaps.length - 1]);
    GENERATIONS.forEach(generation => {
      const $generation = buildGeneration(generation, highestSnap);
      $main.append($generation);
    });

    $window.hashchange();
  }

  $gallery.click(function (e) {
    if (e.target !== this) {
      return;
    }
    hideGallery();
  });

  $closeButton.click(hideGallery);

  $window.swiperight(slideToPreviousSnap)
    .swipeleft(slideToNextSnap)
    .keydown(e => {
      if (keysDown[e.keyCode]) {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      keysDown[e.keyCode] = true;
      switch (e.keyCode) {
        case 37: // left arrow
          return slideToPreviousSnap();
        case 39: // right arrow
          return slideToNextSnap();
        case 27: // escape
          return hideGallery();
      }
    }).keyup(e => {
      keysDown[e.keyCode] = false;
    }).hashchange(() => {
      var snap = getSnapFromHash();
      if (_currentSnap === snap) {
        return;
      }
      if (snaps.indexOf(snap) !== -1) {
        showGalleryImage(snap);
      } else {
        hideGallery();
      }
    });

  function buildGeneration(generation, highestSnap) {
    const $generation = $('<div class="generation">');
    $generation.addClass(generation.region.toLowerCase());

    const $title = buildTitle(generation.region);
    $generation.append($title);

    const start = generation.start;
    const end = Math.min(generation.end, highestSnap);
    const $entries = buildEntries(start, end);
    $generation.append($entries);

    return $generation;
  }

  function buildTitle(region) {
    const $title = $('<div class="region-title">');
    const $region = $('<div class="region-name separator">');
    $region.text(region);
    const $separator = $('<div class="region-line separator">')
    $title.append($region).append($separator);
    return $title;
  }

  function buildEntries(start, end) {
    const $entries = $('<div class="entries">');
    for (let i = start; i <= end; i++) {
      const number = padNumber(i);
      const entry = buildEntry(number);
      if (UNOBTAINABLE.indexOf(i) !== -1) {
        entry.addClass('unobtainable');
      }
      $entries.append(entry);
    }
    // Hacky way to ensure that last row of flex aligns to grid.
    // http://stackoverflow.com/a/22018710
    for (let i = 0; i < 20; i++) {
      $('<div class="entry placeholder">').appendTo($entries);
    }
    return $entries;
  }

  function padNumber(i) {
    let number = i.toString();
    while (number.length < 3) {
      number = '0' + number;
    }
    return number;
  }

  function buildEntry(number) {
    const $entry = $('<div>', {
      id: 'entry-' + number,
      class: 'entry'
    });
    if (snaps.indexOf(number) !== -1) {
      addSnap($entry, number);
    } else {
      $entry.text(number);
    }
    return $entry;
  }

  function addSnap($entry, number) {
    const $img = $('<img>');
    $img.appendTo($entry);
    $img.attr('src', 'snaps/thumbs/' + number + '.jpg');
    $img.click(function () {
      showGalleryImage(number);
    });
  }

  function showGalleryImage(number) {
    setCurrentSnap(number);
    setGalleryImage('current', _currentSnap);
    setGalleryImage('previous', getPreviousSnap());
    setGalleryImage('next', getNextSnap());
    disableScroll();
    $gallery.addClass('active');
  }

  function hideGallery() {
    setCurrentSnap(null);
    $('.gallery-image').attr('src', '');
    enableScroll();
    $gallery.removeClass('active');
  }

  function slideToPreviousSnap() {
    if (!galleryActive()) {
      return;
    }
    const previousSnap = getPreviousSnap();
    if (!previousSnap) {
      const current = $('.current');
      current.removeClass('current').addClass('next');
      setTimeout(function() {
        current.removeClass('next').addClass('current');
      }, 100);
      return;
    }
    setCurrentSnap(previousSnap);
    $('.next').remove();
    $('.current').removeClass('current').addClass('next');
    $('.previous').removeClass('previous').addClass('current');
    $('<img class="gallery-image previous">').prependTo($gallery);
    setGalleryImage('previous', getPreviousSnap());
  }

  function slideToNextSnap() {
    if (!galleryActive()) return;
    const nextSnap = getNextSnap();
    if (!nextSnap) {
      const current = $('.current');
      current.removeClass('current').addClass('previous');
      setTimeout(function() {
        current.removeClass('previous').addClass('current');
      }, 100);
      return;
    }
    setCurrentSnap(nextSnap);
    $('.previous').remove();
    $('.current').removeClass('current').addClass('previous');
    $('.next').removeClass('next').addClass('current');
    $('<img class="gallery-image next">').prependTo($gallery);
    setGalleryImage('next', getNextSnap());
  }

  function galleryActive() {
    return $gallery.hasClass('active');
  }

  function getPreviousSnap() {
    const previousIndex = snaps.indexOf(_currentSnap) - 1;
    return snaps[previousIndex];
  }

  function getNextSnap() {
    const nextIndex = snaps.indexOf(_currentSnap) + 1;
    return snaps[nextIndex];
  }

  function setCurrentSnap(snap) {
    _currentSnap = snap;
    if (snap) {
      history.replaceState(null, null, '#' + snap);
    } else {
      clearHash();
    }
  }

  function setGalleryImage(position, number) {
    if (number === undefined) {
      return;
    }
    $('.' + position + '.gallery-image').attr('src', 'snaps/gallery/' + number + '.jpg');
  }

  function disableScroll() {
    if (scrollDisabled) {
      return;
    }
    scrollTop = $window.scrollTop();
    $body.addClass('no-scroll').css({ top: -scrollTop });
    scrollDisabled = true;
  }

  function enableScroll() {
    if (!scrollDisabled) {
      return;
    }
    $body.removeClass('no-scroll');
    $window.scrollTop(scrollTop);
    scrollDisabled = false;
  }

  function getSnapFromHash() {
    return location.hash.replace(/^#/, '') || null;
  }

  function clearHash(number) {
    if (!getSnapFromHash()) {
      return;
    }
    history.replaceState(null, null, location.pathname);
    $window.hashchange();
  }
});
