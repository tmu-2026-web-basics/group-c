const bgm = document.getElementById('bgm');
const soundBtn = document.getElementById('soundBtn');
const soundBtnIcon = document.getElementById('soundBtnIcon');

function updateBtnIcon() {
  const isOn = localStorage.getItem('bgmEnabled') === 'true';

  soundBtnIcon.src = isOn ? '../images/on.png' : '../images/off.png';
  soundBtnIcon.alt = isOn ? '音声ON' : '音声OFF';
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

// 質問への回答を保存し、次のページ（または結果ページ）へ進む処理
const nextButton = document.getElementById('nextBtn');

if (nextButton) {
  nextButton.addEventListener('click', () => {
    const page = nextButton.dataset.page; // 'q1' または 'q2'
    const checked = document.querySelector(`input[name="${page}"]:checked`);

    if (!checked) {
      alert('いずれかの項目を選択してください');
      return;
    }

    if (page === 'q1') {
      // Q1の回答（far / near）を保存してQ2へ
      localStorage.setItem('q1Answer', checked.value);
      location.href = 'sindan-2.html';

    } else if (page === 'q2') {
      // Q1・Q2の回答を組み合わせて結果ページを決定
      const q1Answer = localStorage.getItem('q1Answer');
      const q2Answer = checked.value;

      const resultMap = {
        far:  { adventure: '../medicine/result-a.html', excited: '../medicine/result-b.html', serenity: '../medicine/result-c.html', refresh: '../medicine/result-d.html', nostalgic: '../medicine/result-e.html' },
        near: { adventure: '../medicine/result-f.html', excited: '../medicine/result-g.html', serenity: '../medicine/result-h.html', refresh: '../medicine/result-i.html', nostalgic: '../medicine/result-j.html' }
      };

      const resultPage = resultMap[q1Answer]?.[q2Answer];

      if (resultPage) {
        const overlay = document.getElementById('resultOverlay');

        if (overlay) {
          nextButton.disabled = true; // 演出中の連打を防止
          overlay.classList.add('show');

          setTimeout(() => {
            location.href = resultPage;
          }, 2500); // フェードイン後、2.5秒表示してから遷移
        } else {
          location.href = resultPage;
        }
      } else {
        // Q1の回答が保存されていない（sindan-1.htmlを経由していない等）場合
        alert('回答の取得に失敗しました。最初からやり直してください。');
        location.href = 'sindan-1.html';
      }
    }
  });
}