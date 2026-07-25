const bgm = document.getElementById('bgm');
const soundBtn = document.getElementById('soundBtn');
const soundBtnIcon = document.getElementById('soundBtnIcon');
const soundBtn2 = document.getElementById('soundBtn2');
const soundBtnIcon2 = document.getElementById('soundBtnIcon2');

function updateBtnIcon() {
  const isOn = localStorage.getItem('bgmEnabled') === 'true';
  const src = isOn ? '../images/on.png' : '../images/off.png';
  const alt = isOn ? '音声ON' : '音声OFF';

  soundBtnIcon.src = src;
  soundBtnIcon.alt = alt;

  if (soundBtnIcon2) {
    soundBtnIcon2.src = src;
    soundBtnIcon2.alt = alt;
  }
}

// index.htmlで選んだ音声設定を、診断ページの初期状態に反映
const savedPref = localStorage.getItem('bgmEnabled');

if (savedPref === 'true') {
  bgm.play().catch(() => {
    console.log('自動再生がブロックされました');
  });
} else {
  bgm.pause();
}

// 初期表示時に、index.htmlで選んだON/OFFアイコンにする
updateBtnIcon();

// 診断ページのmain-head右側ボタンでもON/OFF切り替え
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

// 動画オーバーレイ側の音声ボタン（動画自体のミュートON/OFFを切り替え）
if (soundBtn2) {
  soundBtn2.addEventListener('click', () => {
    const isOn = localStorage.getItem('bgmEnabled') === 'true';

    if (isOn) {
      video.muted = true;
      localStorage.setItem('bgmEnabled', 'false');
    } else {
      video.muted = false;
      localStorage.setItem('bgmEnabled', 'true');
    }

    updateBtnIcon();
  });
}

// 服用ボタンクリック時に、GIFをフェードイン→再生完了後に動画を表示（ページ遷移はしない）
const hukuyouBtn = document.getElementById('hukuyouBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingGif = document.getElementById('loadingGif');
const videoOverlay = document.getElementById('videoOverlay');
const video = document.getElementById('video');
const videoFooter = document.getElementById('videoFooter');
const backBtn = document.getElementById('backBtn');

// GIFの再生時間（ミリ秒）。実際の長さに合わせて調整してください
const GIF_DURATION = 2800;

if (hukuyouBtn && loadingOverlay && loadingGif && videoOverlay && video) {
  hukuyouBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // ★クリックした瞬間に初めてGIFを読み込み・再生開始
    loadingGif.src = loadingGif.dataset.src;

    // ★クリック操作の直後（同期的）に動画の再生も開始することで、
    //    音声設定がONなら音声ありでの再生がブロックされないようにする
    const isOn = localStorage.getItem('bgmEnabled') === 'true';
    video.currentTime = 0;
    video.muted = !isOn;
    video.loop = true;
    video.play().catch(() => {
      console.log('動画の再生がブロックされました');
    });

    loadingOverlay.classList.add('show');

    setTimeout(() => {
      // GIFを隠して動画オーバーレイを表示（動画はすでに裏で再生中）
      loadingOverlay.classList.remove('show');
      videoOverlay.classList.add('show');
    }, GIF_DURATION);
  });
}

// 診断に戻るボタン：動画を止めてsindan-1.htmlへ遷移
if (backBtn && video) {
  backBtn.addEventListener('click', () => {
    video.pause();
    location.href = '../sindan/sindan-1.html';
  });
}
