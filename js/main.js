/**
 * 緑ヶ丘女子高等学校 LP — メインスクリプト
 *
 * 担当: このファイルはアニメーション・インタラクションを管理します
 * 更新時は各セクションのコメントを参照してください
 */

'use strict';

/* ========================================
   ユーティリティ
======================================== */

/**
 * アニメーションのモーション無効設定を確認
 * システム設定で「アニメーション削減」が有効な場合は
 * アニメーションをスキップする
 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ========================================
   1. ナビバー — スクロール時スタイル変更
======================================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 80; // px — これを超えたら背景白に変化

  function handleNavbarScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  // スクロールイベント（passive で登録してパフォーマンス最適化）
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  // 初回チェック（リロード時にすでにスクロール済みの場合に対応）
  handleNavbarScroll();
})();


/* ========================================
   2. ハンバーガーメニュー — ドロワー開閉
======================================== */
(function initHamburger() {
  const hamburger    = document.getElementById('hamburger');
  const drawer       = document.getElementById('drawer');
  const overlay      = document.getElementById('drawer-overlay');
  const drawerLinks  = document.querySelectorAll('.drawer__link');

  if (!hamburger || !drawer || !overlay) return;

  /** ドロワーを開く */
  function openDrawer() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden'; // 背景スクロールを防ぐ
  }

  /** ドロワーを閉じる */
  function closeDrawer() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  // ハンバーガーボタンのクリック
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });

  // オーバーレイのクリックで閉じる
  overlay.addEventListener('click', closeDrawer);

  // ドロワー内リンクをクリックしたら閉じる
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Esc キーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
      hamburger.focus(); // フォーカスをハンバーガーに戻す
    }
  });
})();


/* ========================================
   3. Hero — テキスト staggered フェードイン
   各 .animate-item に data-delay 属性（秒）を指定し、
   その値に応じて遅延付きで .is-visible を付与する
======================================== */
(function initHeroAnimation() {
  if (prefersReducedMotion) return; // アニメーション削減設定の場合はスキップ

  const items = document.querySelectorAll('.animate-item');

  items.forEach(item => {
    const delay = parseFloat(item.dataset.delay || '0') * 1000; // 秒 → ミリ秒

    setTimeout(() => {
      item.classList.add('is-visible');
    }, delay);
  });
})();


/* ========================================
   4. Hero — パララックス効果
   スクロールに連動して背景画像を translateY で動かす
   速度係数 PARALLAX_SPEED を変えると動きの強さが変わる
======================================== */
(function initParallax() {
  if (prefersReducedMotion) return;

  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  const PARALLAX_SPEED = 0.3; // スクロール量の何倍動かすか（0.1〜0.5 が自然）

  // requestAnimationFrame でスムーズに処理
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const heroHeight = document.getElementById('hero')?.offsetHeight || window.innerHeight;

    // Hero の表示範囲内のみパララックスを適用（パフォーマンス最適化）
    if (scrollY < heroHeight) {
      const offset = scrollY * PARALLAX_SPEED;
      heroBg.style.transform = `translateY(${offset}px)`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ========================================
   5. スムーズスクロール — アンカーリンク対応
   ナビリンクや CTA ボタンのアンカー（#xxx）クリック時に
   ナビバーの高さ分だけオフセットしてスクロール
======================================== */
(function initSmoothScroll() {
  const NAVBAR_HEIGHT = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '64',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'instant' : 'smooth',
      });
    });
  });
})();


/* ========================================
   6. events.json の読み込み（将来用プレースホルダー）
   イベントセクション（#event）追加時に実装予定
   events.json のフォーマット例：
   [
     {
       "id": 1,
       "type": "説明会",
       "date": "2025-11-15",
       "time": "14:00",
       "capacity": 30,
       "remaining": 12,
       "apply_url": "https://..."
     }
   ]
======================================== */
async function loadEvents() {
  try {
    const response = await fetch('./events.json');
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const events = await response.json();
    return events;
  } catch (err) {
    console.warn('events.json の読み込みに失敗しました:', err.message);
    return [];
  }
}

// イベントセクション追加時にここで呼び出す
// document.addEventListener('DOMContentLoaded', async () => {
//   const events = await loadEvents();
//   renderEvents(events); // 別途実装
// });


/* ========================================
   7. スクロールリビール（IntersectionObserver）
   .scroll-reveal クラスを持つ要素が画面に入ったら
   .is-visible を付与してアニメーションを発火させる
======================================== */
(function initScrollReveal() {
  if (prefersReducedMotion) {
    // アニメーション削減設定の場合は即表示
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
})();


/* ========================================
   8. 数字カウントアップアニメーション
   data-count 属性の値まで 0 からカウントアップする
======================================== */
(function initCountUp() {
  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);

      if (prefersReducedMotion) {
        el.textContent = target;
        countUpObserver.unobserve(el);
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      countUpObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.why__stat-num[data-count]').forEach(el => countUpObserver.observe(el));
})();


/* ========================================
   9. Point カード — stagger delay の初期化
   style属性の CSS カスタムプロパティ（--delay）を
   transition-delay として明示的に設定する
======================================== */
document.querySelectorAll('.point-card.scroll-reveal').forEach(card => {
  const delay = card.style.getPropertyValue('--delay') || '0s';
  card.style.transitionDelay = delay;
});


/* ========================================
   Section 5：タブ切り替え（雑誌風）
======================================== */
(function initProgTabs() {
  const progTabs   = document.querySelectorAll('.prog-tab');
  const progPanels = document.querySelectorAll('.prog-panel');

  if (!progTabs.length) return;

  progTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      /* タブの切り替え */
      progTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      /* パネルの切り替え */
      progPanels.forEach(panel => {
        if (panel.id === `panel-${target}`) {
          panel.removeAttribute('hidden');
          requestAnimationFrame(() => panel.classList.add('is-active'));
        } else {
          panel.classList.remove('is-active');
          panel.addEventListener('transitionend', () => {
            if (!panel.classList.contains('is-active')) {
              panel.setAttribute('hidden', '');
            }
          }, { once: true });
        }
      });
    });
  });
})();


/* プログラム前後ナビボタン */
document.querySelectorAll('.prog-nav__btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const targetTab = document.querySelector(`.prog-tab[data-target="${target}"]`);
    if (targetTab) {
      targetTab.click();
      /* タブ位置までスクロール */
      document.querySelector('.prog-tabs').scrollIntoView({
        behavior: 'smooth', block: 'nearest'
      });
    }
  });
});


/* フロー図：クラスカード → クラス説明へスクロール */
document.querySelectorAll('.flow__class[data-class-target]').forEach(card => {
  const activate = () => {
    const target = document.getElementById(card.dataset.classTarget);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
});


/* フロー図：プログラムカード → プログラムタブ切り替え＋スクロール */
document.querySelectorAll('.flow__program[data-prog-target]').forEach(card => {
  const activate = () => {
    const target = card.dataset.progTarget;
    const tab = document.querySelector(`.prog-tab[data-target="${target}"]`);
    if (tab) {
      tab.click();
      document.querySelector('.prog-tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
});
