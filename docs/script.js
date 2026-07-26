// こことかでの音声設定が今後ページを飛んでも反映されるように設定する
const bgm = document.getElementById('bgm');
const overlay = document.getElementById('volumeOverlay');
const soundOn = document.getElementById('soundOn');
const soundOff = document.getElementById('soundOff');

// main-head右側の音声ON/OFFボタン
const soundBtn = document.getElementById('soundBtn');
const soundBtnIcon = document.getElementById('soundBtnIcon');

// main-headの音声アイコンを現在の設定に合わせる
function updateBtnIcon() {
  const isOn = localStorage.getItem('bgmEnabled') === 'true';
  soundBtnIcon.src = isOn ? 'images/on.png' : 'images/off.png';
  soundBtnIcon.alt = isOn ? '音声ON' : '音声OFF';
}

// ページ読み込み時、以前の設定があれば復元
const savedPref = localStorage.getItem('bgmEnabled');

if (savedPref === 'true') {
  bgm.play().catch(() => {
    console.log('自動再生がブロックされました');
  });
}

// 初期状態のアイコンを反映
updateBtnIcon();

// 最初の画面でONをクリック
soundOn.addEventListener('click', () => {
  bgm.play().catch(() => {
    console.log('再生がブロックされました');
  });

  localStorage.setItem('bgmEnabled', 'true');
  updateBtnIcon();
  fadeOutOverlay();
});

// 最初の画面でOFFをクリック
soundOff.addEventListener('click', () => {
  bgm.pause();
  localStorage.setItem('bgmEnabled', 'false');
  updateBtnIcon();
  fadeOutOverlay();
});

// フェードアウト処理
function fadeOutOverlay() {
  overlay.classList.add('is-hidden');
}

// introduce-band h3 横フェードイン
const introTexts = document.querySelectorAll('.introduce-band h3');

const introObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  },
  {
    threshold: 0.3
  }
);

introTexts.forEach((item) => {
  introObserver.observe(item);
});

// stackが画面の半分あたりまで来たら、h1ラベルが画面トップに吸い付き、main本文が浮かび上がる
// 逆に上スクロールで戻ると、main本文はフェードアウトし、SCROLLの位置まで自動で戻る
const stack = document.getElementById('stack');
const mainContext = document.getElementById('maincontext');
const mainHead = document.getElementById('mainHead');
const scrollText = document.getElementById('scrollText');

let isExpanded = false;
let ticking = false;
let isSnapping = false;
let lastScrollY = window.scrollY;

const ENTER_BUFFER = 150;
const EXIT_BUFFER = 150;
const SNAP_DURATION = 1600;

// 強めのイージング
function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

// targetYまで独自アニメーションでスクロールする
function animateScrollTo(targetY, onComplete, onProgress) {
  const startY = window.scrollY;
  const diff = targetY - startY;

  if (Math.abs(diff) < 1) {
    if (onProgress) onProgress(1);
    if (onComplete) onComplete();
    return;
  }

  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / SNAP_DURATION, 1);
    const eased = easeOutQuint(t);

    window.scrollTo(0, startY + diff * eased);

    if (onProgress) onProgress(t);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(step);
}

const INTRO_REST_UP_OFFSET = 260;

// 「SCROLL」の文字が画面中央より少し下にくる位置のscrollY値を計算
function getIntroRestY() {
  const rect = scrollText.getBoundingClientRect();
  const docTop = rect.top + window.scrollY;

  return Math.max(docTop - window.innerHeight / 2 - INTRO_REST_UP_OFFSET, 0);
}

// main-head の高さを取得
function getHeaderHeight() {
  const headerInner = mainHead.querySelector('h1');

  return headerInner ? headerInner.offsetHeight : 110;
}

/*
  main h3を画面上のどの高さに表示するか。
  段階的な分岐だと、幅の境界をまたいだ瞬間に数値が大きくジャンプして
  「狭めると急に上がりすぎ／下がりすぎる」現象が起きるため、
  区間ごとになめらかに直線補間する。

  style.cssの@mediaブレークポイント(900px, 760px)でレイアウトの
  構造自体が切り替わるため、JS側の補間もそれに合わせて
  WIDE→MID→NARROWの3区間に分けている。

  ・WIDE_WIDTH以上の画面幅では WIDE_OFFSET 固定
  ・MID_WIDTH（=760pxの少し内側、CSSのレイアウト切り替え地点）では MID_OFFSET
  ・NARROW_WIDTH以下の画面幅では NARROW_OFFSET 固定
  ・区間の間は自動でなめらかに変化する

  文章をもっと下げたい／上げたい場合は、この6つの数値だけを調整すればよい。
  ※ NARROW_OFFSET を大きくしすぎると、下のMath.maxで0にクランプされて
    （スクロールが起きず）逆に文章が上がりすぎて見えるので注意。

  ※ MID_OFFSET / NARROW_OFFSET は仮の値。実機（826px前後・691px前後など）
    で表示を確認しながら微調整すること。
*/
const WIDE_WIDTH = 900;
const WIDE_OFFSET = 90;

const MID_WIDTH = 760;   // style.cssのレイアウト切り替え地点に合わせる
const MID_OFFSET = 40;   // 仮値：826px前後で下がりすぎる場合はここを小さく

const NARROW_WIDTH = 375;
const NARROW_OFFSET = 260; // 仮値：691px前後で上がりすぎる場合はここを大きく

function getDesiredTextTopOffset() {
  const width = window.innerWidth;

  if (width >= WIDE_WIDTH) return WIDE_OFFSET;
  if (width <= NARROW_WIDTH) return NARROW_OFFSET;

  if (width > MID_WIDTH) {
    // WIDE_WIDTH 〜 MID_WIDTH の間をなめらかに補間
    const ratio = (WIDE_WIDTH - width) / (WIDE_WIDTH - MID_WIDTH);
    return WIDE_OFFSET + (MID_OFFSET - WIDE_OFFSET) * ratio;
  }

  // MID_WIDTH 〜 NARROW_WIDTH の間をなめらかに補間
  const ratio = (MID_WIDTH - width) / (MID_WIDTH - NARROW_WIDTH);
  return MID_OFFSET + (NARROW_OFFSET - MID_OFFSET) * ratio;
}

// main の h3 が画面内の指定位置に来るように計算
// desiredTextTop の数値を大きくすると、ichiran.pngはそのままで文章だけ下に見える
function getExpandedRestY() {
  const firstMainText = mainContext.querySelector('h3');

  if (!firstMainText) {
    const rect = stack.getBoundingClientRect();
    return rect.top + window.scrollY;
  }

  const textRect = firstMainText.getBoundingClientRect();
  const textDocTop = textRect.top + window.scrollY;
  const headerHeight = getHeaderHeight();

  const desiredTextTop = headerHeight + getDesiredTextTopOffset();

  return Math.max(textDocTop - desiredTextTop, 0);
}

const FADE_START_PROGRESS = 0.4;

// 下スクロール時：2枚目の位置までジャンプ
function triggerExpand() {
  isExpanded = true;
  isSnapping = true;

  let faded = false;

  animateScrollTo(
    getExpandedRestY(),
    () => {
      isSnapping = false;
      lastScrollY = window.scrollY;
    },
    (t) => {
      if (!faded && t >= FADE_START_PROGRESS) {
        faded = true;
        mainHead.classList.add('is-visible');
        mainContext.classList.add('is-visible');
      }
    }
  );
}

// 上スクロール時：1枚目の位置まで戻る
function triggerCollapse() {
  isExpanded = false;

  mainHead.classList.remove('is-visible');
  mainContext.classList.remove('is-visible');

  isSnapping = true;

  animateScrollTo(getIntroRestY(), () => {
    isSnapping = false;
    lastScrollY = window.scrollY;
  });
}

function updateHeaderState() {
  if (isSnapping) {
    ticking = false;
    return;
  }

  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > lastScrollY;

  lastScrollY = currentScrollY;

  const introY = getIntroRestY();
  const expandedY = getExpandedRestY();

  if (!isExpanded && scrollingDown && currentScrollY > introY + ENTER_BUFFER) {
    triggerExpand();
  } else if (isExpanded && !scrollingDown && currentScrollY < expandedY - EXIT_BUFFER) {
    triggerCollapse();
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateHeaderState);
    ticking = true;
  }
});

// 初期表示時にも一度チェック
updateHeaderState();

// main-head右側の音声ON/OFFボタンをクリック
soundBtn.addEventListener('click', () => {
  const isOn = localStorage.getItem('bgmEnabled') === 'true';

  if (isOn) {
    bgm.pause();
    localStorage.setItem('bgmEnabled', 'false');
  } else {
    bgm.play().catch(() => {
      console.log('再生がブロックされました');
    });

    localStorage.setItem('bgmEnabled', 'true');
  }

  updateBtnIcon();
});

const footerNatsuLink = document.getElementById('footerNatsuLink');
const natsuListTitle = document.getElementById('natsuListTitle');
const jumpToNatsu = document.getElementById('jumpToNatsu');

const HEADER_OFFSET = 140;

// main-headの高さぶん、見出しが隠れないように差し引く
function getNatsuListTitleY() {
  const rect = natsuListTitle.getBoundingClientRect();

  return rect.top + window.scrollY - HEADER_OFFSET;
}

function moveToNatsuList() {
  if (!isExpanded) {
    isExpanded = true;
    mainHead.classList.add('is-visible');
    mainContext.classList.add('is-visible');
  }

  isSnapping = true;

  animateScrollTo(
    getNatsuListTitleY(),
    () => {
      isSnapping = false;
      lastScrollY = window.scrollY;
    }
  );
}

if (footerNatsuLink) {
  footerNatsuLink.addEventListener('click', (e) => {
    e.preventDefault();
    moveToNatsuList();
  });
}

if (jumpToNatsu) {
  jumpToNatsu.addEventListener('click', () => {
    moveToNatsuList();
  });
}