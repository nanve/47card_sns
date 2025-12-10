// ==========================================
// ★ここに新しいGASのウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz5Xh5Fvj59fgr98dYAWq3dGK5ZAEV0M67e6wCyS_Y1rg0p44RksNKlzeWjghXuKpS-/exec'; 
// ==========================================

// 要素取得
const imageEl = document.getElementById('post-image');
const nameEl = document.getElementById('post-name');
const captionEl = document.getElementById('caption-text');
const counterEl = document.getElementById('page-counter');
const downloadBtn = document.getElementById('download-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const copyBtn = document.getElementById('copy-btn');
const instaBtn = document.getElementById('open-insta');
const toast = document.getElementById('toast');

// データ管理用
let allPosts = [];
let currentIndex = 0;

// 初期化
async function init() {
    try {
        const res = await fetch(GAS_API_URL);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        // データ反転（必要なら）: スプレッドシートの下に追加していくなら反転して最新を先頭にするのもあり
        // 今回はシートの上から順に表示します
        allPosts = data;

        if (allPosts.length > 0) {
            renderPost(0);
        } else {
            alert('データが見つかりませんでした。スプレッドシートのヘッダーを確認してください。');
        }

    } catch (e) {
        console.error(e);
        alert('データの読み込みに失敗しました。');
    }
}

// 投稿データの表示
function renderPost(index) {
    if (index < 0 || index >= allPosts.length) return;
    
    currentIndex = index;
    const post = allPosts[currentIndex];

    // 画像表示（Google Driveの画像URL形式を調整）
    // ※もしURLが lh3.googleusercontent... 系ならそのまま、drive.google.com...なら変換など
    // 基本的にGASで取得した時点で表示可能なURLになっていると仮定しますが、
    // 万が一のためGoogle DriveのView URLをImage Tag用URLへ変換するロジックを入れることも可能です。
    imageEl.src = post.Image;
    downloadBtn.href = post.Image; // 別タブで開く用

    // テキスト表示
    nameEl.textContent = post.Name || 'No Name';
    captionEl.value = post.Caption || '';

    // カウンター更新
    counterEl.textContent = `${currentIndex + 1} / ${allPosts.length}`;

    // ボタン状態更新
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === allPosts.length - 1;
}

// コピー機能
copyBtn.addEventListener('click', async () => {
    const text = captionEl.value;
    try {
        await navigator.clipboard.writeText(text);
        showToast('キャプションをコピーしました！');
    } catch (err) {
        // iOS Safariなどでセキュリティ制限により失敗した場合のフォールバック
        captionEl.select();
        document.execCommand('copy');
        showToast('コピーしました！(予備)');
    }
});

// Instagram起動
instaBtn.addEventListener('click', () => {
    // Instagramアプリを起動するURLスキーム
    // iOS/Androidで挙動が違う場合がありますが、基本はアプリが開きます
    window.location.href = 'instagram://app';
    
    // PCなどでアプリがない場合のために、少し待ってからWeb版へ遷移させる処理も可能ですが
    // 今回はシンプルにします
    setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
    }, 500);
});

// ナビゲーション
prevBtn.addEventListener('click', () => renderPost(currentIndex - 1));
nextBtn.addEventListener('click', () => renderPost(currentIndex + 1));

// トースト表示
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000);
}

// アプリ起動
init();