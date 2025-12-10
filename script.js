// ==========================================
// ★ここに新しいGASのウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyRYKDexL7ivCYQcb5HquY-LFsiY3PGOIS-4Jw3cdOzYYBl8RdRrDtP_m-IKH6QhDW7/exec'; 
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

// 今日の日付を "YYYY/MM/DD" 形式で取得する関数
function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    // 月と日は1桁の場合に0を埋める (例: 1月 -> 01)
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 初期化
async function init() {
    try {
        const res = await fetch(GAS_API_URL);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        allPosts = data;

        if (allPosts.length > 0) {
            // 1. 今日の日付文字列を作る ("2025/12/10" など)
            const todayStr = getTodayString();
            
            // 2. データの中から「Data」カラムが今日と一致するものを探す
            // (スプレッドシートのA列ヘッダーが "Data" である前提)
            const todayIndex = allPosts.findIndex(post => post.Data === todayStr);

            if (todayIndex !== -1) {
                // 一致する日付が見つかったら、そのインデックスを表示
                renderPost(todayIndex);
                showToast(`今日 (${todayStr}) の投稿を表示します`);
            } else {
                // 見つからなければ、とりあえず先頭(0番目)を表示
                renderPost(0);
                // コンソールにログを出しておく（デバッグ用）
                console.log(`今日の日付 (${todayStr}) に一致するデータが見つかりませんでした。先頭を表示します。`);
            }

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

    // 画像表示
    imageEl.src = post.Image;
    downloadBtn.href = post.Image; // 別タブで開く用

    // テキスト表示
    nameEl.textContent = post.Name || 'No Name';
    captionEl.value = post.Caption || '';

    // カウンター更新
    // 日付情報があればそれも表示すると便利かもしれません
    const dateStr = post.Data ? ` [${post.Data}]` : '';
    counterEl.textContent = `${currentIndex + 1} / ${allPosts.length}${dateStr}`;

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
    window.location.href = 'instagram://app';
    
    // PCなどでアプリがない場合のために、少し待ってからWeb版へ遷移させる処理
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