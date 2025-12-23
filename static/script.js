// パララックスコンテナを取得
const container = document.getElementById('parallax-container');
// すべてのパララックスレイヤーを取得
const layers = document.querySelectorAll('.parallax-layer');

// --- パララックス処理（前回のコードと同じ） ---
container.addEventListener('mousemove', (e) => {
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    
    const mouseX = e.clientX - container.getBoundingClientRect().left - centerX;
    const mouseY = e.clientY - container.getBoundingClientRect().top - centerY;

    layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        const x = -mouseX * speed; 
        const y = -mouseY * speed;

        layer.style.transform = `translate(${x}px, ${y}px)`;
    });
});
// ----------------------------------------------


// --- 新しい機能: 画像切り替え関数 ---
function showMouth(vowel) {
    // すべての口の形レイヤーを非表示にする
    layers.forEach(layer => {
        // 背景（mouth-inside.jpg）は常に表示状態にする
        if (layer.getAttribute('data-layer-type') === 'vowel') {
            layer.style.display = 'none';
        }
    });

    // 選択された口の形を表示する
    if (vowel !== 'none') {
        const selectedLayer = document.getElementById(`mouth-${vowel}`);
        if (selectedLayer) {
            selectedLayer.style.display = 'block'; // または 'inline-block'
        }
    }
}

// ... 既存のパララックス処理 (mousemoveイベントリスナー) はそのまま残す ...
// ----------------------------------------------------------------------


// --- 新しい機能: 画像切り替え関数と調整ロジック ---

// 現在操作対象になっているレイヤーを保持する変数
let currentLayer = document.getElementById('mouth-inside');

// スライダー要素を取得
const posYSlider = document.getElementById('pos-y-slider');
const posXSlider = document.getElementById('pos-x-slider');
const sizeSlider = document.getElementById('size-slider');
const layerNameDisplay = document.getElementById('current-layer-name');


/**
 * 選択中のレイヤーに、スライダーの値に基づいてCSSのtransformを適用する
 * @param {HTMLElement} layer - 調整対象のDOM要素
 * @param {number} yOffset - Y軸の調整値
 * @param {number} xOffset - X軸の調整値
 * @param {number} size - サイズ調整値
 */
// --- applyAdjustments 関数の修正 ---
function applyAdjustments(layer, yOffset, xOffset, size) {
    // 基準位置 (-50%) にスライダーの値を加算/減算する
    const adjustedY = -50 + yOffset; 
    const adjustedX = -50 + xOffset; 
    const sizePercent = `${size}%`;
    
    // 🚨 修正点 1: CSS変数を使って調整後の基準位置を記録する
    // これにより、パララックス処理がこの値を読み込んで使用できるようになる
    layer.style.setProperty('--adjusted-x', `${adjustedX}%`);
    // レイヤーを上にずらすためのオフセット（例：50px上に上げる）
    const initialYOffset = -50; 

    // 初期配置の計算（-50% が中央なので、そこからさらにマイナスする）
    layer.style.setProperty('--adjusted-y', `calc(-50% + ${initialYOffset}px)`);
    
    // サイズ調整はそのまま適用
    layer.style.width = sizePercent;
    layer.style.height = sizePercent;
    
    // 🚨 修正点 2: ここで transform を直接設定するのはやめます
    // transform: translate(-50%, -50%) の基準位置はCSS側で設定済みのため不要
    // layer.style.transform = `translate(${adjustedX}%, ${adjustedY}%)`; <--- この行は削除！
}

// ... setupSliders 関数はそのまま ...


/**
 * 外部から呼び出される、口の形切り替え関数
 */
function showMouth(vowel) {
    // 1. 全ての母音レイヤーを非表示にする
    layers.forEach(layer => {
        if (layer.getAttribute('data-layer-type') === 'vowel') {
            layer.style.display = 'none';
        }
    });

    // 2. 選択されたレイヤーを表示し、currentLayerを更新
    let newLayer = null;
    if (vowel === 'none') {
        newLayer = document.getElementById('mouth-inside'); // 背景を操作対象にする
        // 背景は常に表示なので、操作対象を切り替えるだけ
    } else {
        newLayer = document.getElementById(`mouth-${vowel}`);
        if (newLayer) {
            newLayer.style.display = 'block';
        }
    }
    
    // 3. 操作対象を切り替える
    currentLayer = newLayer;
    
    // 4. スライダーの表示名を更新
    layerNameDisplay.textContent = currentLayer.getAttribute('data-initial-name');
    
    // 5. スライダーをリセットまたは現在の状態に合わせる処理（オプション）
    // 現状はリセットせず、新しいパーツを調整できるようにします
}


// --- スライダーイベントリスナーの追加 ---
function setupSliders() {
    // スライダーの値が変更されたら、現在選択中のレイヤーに反映する
    const update = () => {
        if (currentLayer) {
            applyAdjustments(
                currentLayer, 
                parseFloat(posYSlider.value), 
                parseFloat(posXSlider.value),
                parseFloat(sizeSlider.value)
            );
            checkGap();
        }
    };
    
    posYSlider.addEventListener('input', update);
    posXSlider.addEventListener('input', update);
    sizeSlider.addEventListener('input', update);
}


// ページロード時の初期設定
// --- Parallax 処理 (container.addEventListener('mousemove', ...)) の修正 ---
// --- Parallax 処理の修正版 ---
container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    
    // 中心からの距離（px）
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;

    // コンテナの最大半径（中心から角までの距離の目安）
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    // 現在のマウスの距離
    const currentDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);

    // 🚨 減衰率の計算 (0.0 ～ 1.0)
    // 中心(0)なら1.0（そのまま動く）、外に行くほど0に近づく
    let damping = 1.0 - (currentDistance / maxDistance);
    damping = Math.max(0, damping); // 0以下にならないようにガード

    layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        
        // 🚨 減衰率(damping)を掛け合わせる
        const parallaxX = mouseX * speed * damping; 
        const parallaxY = mouseY * speed * damping;

        const adjustedX = layer.style.getPropertyValue('--adjusted-x') || '-50%';
        const adjustedY = layer.style.getPropertyValue('--adjusted-y') || '-50%';

        layer.style.transform = `translate(${adjustedX}, ${adjustedY}) translate(${parallaxX}px, ${parallaxY}px)`;
    });

    requestAnimationFrame(checkGap);
});

// =========================================================
// 🧩 隙間判定ロジック (Pixel Perfect Gap Detection)
// =========================================================

const gapCanvas = document.getElementById('gap-check-canvas');
const gapCtx = gapCanvas.getContext('2d', { willReadFrequently: true });
const gapAlert = document.getElementById('gap-alert');
const gapRatioDisplay = document.getElementById('gap-ratio');

/**
 * 隙間をリアルタイムでチェックする関数
 */
function checkGap() {
    if (!currentLayer) return;

    // 1. 要素と位置情報の取得
    const bgLayer = document.getElementById('mouth-inside');
    const containerRect = container.getBoundingClientRect();
    
    // 🚨 追従のための計算: 口のパーツが今どこにいるか取得
    const mouthRect = currentLayer.getBoundingClientRect();

    // 2. キャンバスの初期化（緑塗りつぶし）
    gapCtx.fillStyle = '#00FF00';
    gapCtx.fillRect(0, 0, gapCanvas.width, gapCanvas.height);

    // 3. 描画位置の計算関数（変更なし）
    const drawToCanvas = (imgElement) => {
        const rect = imgElement.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2+60;
        
        // コンテナ中心を基準としたキャンバス上の描画位置
        const imgX = rect.left - containerCenterX + (gapCanvas.width / 2);
        const imgY = rect.top - containerCenterY + (gapCanvas.height / 2);
        gapCtx.drawImage(imgElement, imgX, imgY, rect.width, rect.height);
    };

    // 4. 描画
    drawToCanvas(bgLayer);     // 奥
    drawToCanvas(currentLayer); // 手前

    // -------------------------------------------------------
    // 🚨 ここが大改造ポイント：スキャン範囲の追従計算
    // -------------------------------------------------------
    const scanSize = 30; 

    // A. コンテナの中心座標
    const cx = containerRect.left + containerRect.width / 2;
    const cy = containerRect.top + containerRect.height / 2;

    // B. 現在の口パーツの中心座標
    const mx = mouthRect.left + mouthRect.width / 2;
    const my = mouthRect.top + mouthRect.height / 2;

    // C. ズレの量（オフセット）を計算
    const offsetX = mx - cx;
    const offsetY = my - cy;

    // D. キャンバスの中心にオフセットを加えて、スキャン開始位置を決定
    // gapCanvas.width / 2 はキャンバスの中心点
    const startX = (gapCanvas.width / 2) + offsetX - (scanSize / 2);
    const startY = (gapCanvas.height / 2) + offsetY - (scanSize / 2);

    // -------------------------------------------------------

    // 5. データ取得と可視化
    // 範囲外エラーを防ぐため、キャンバス内に収まるように座標を制限（念のため）
    const safeX = Math.max(0, Math.min(startX, gapCanvas.width - scanSize));
    const safeY = Math.max(0, Math.min(startY, gapCanvas.height - scanSize));

    const imageData = gapCtx.getImageData(safeX, safeY, scanSize, scanSize);
    
    // 赤枠を描画（ここが実際に判定している場所！）
    gapCtx.strokeStyle = 'red';
    gapCtx.lineWidth = 2;
    gapCtx.strokeRect(safeX, safeY, scanSize, scanSize);

    // 6. 緑ピクセル判定（変更なし）
    const data = imageData.data;
    let greenPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        // 緑(G)が強く、赤(R)青(B)が弱い場合
        if (data[i+1] > 200 && data[i] < 100 && data[i+2] < 100) {
            greenPixelCount++;
        }
    }

    // --- script.js の最後、判定結果の表示部分を書き換え ---

if (greenPixelCount === 0) {
    // 0px の場合
    gapAlert.style.display = 'none'; // 警告を隠す
    gapRatioDisplay.style.color = 'green';
    gapRatioDisplay.textContent = ` 隙間なし (0px)`;
} else {
    gapAlert.style.display = 'block'; // 警告を表示
    
    if (greenPixelCount >= 1 && greenPixelCount <= 10) {
        // 1〜10px: わずかな隙間
        gapAlert.style.background = 'rgba(255, 165, 0, 0.8)'; // オレンジ色
        gapAlert.textContent = ` わずかな隙間 (${greenPixelCount}px)`;
        gapRatioDisplay.style.color = 'orange';
        gapRatioDisplay.textContent = ` わずかな隙間 (${greenPixelCount}px)`;
        
    } else if (greenPixelCount > 10 && greenPixelCount < 50) {
        // 11〜49px: 注意が必要な隙間
        gapAlert.style.background = 'rgba(255, 69, 0, 0.9)'; // オレンジレッド
        gapAlert.textContent = ` 隙間あり (${greenPixelCount}px)`;
        gapRatioDisplay.style.color = '#FF4500';
        gapRatioDisplay.textContent = ` 隙間あり (${greenPixelCount}px)`;
        
    } else {
        // 50px以上: 明らかな隙間
        gapAlert.style.background = 'rgba(255, 0, 0, 1.0)'; // 真っ赤（不透明）
        gapAlert.textContent = ` 致命的な隙間 (${greenPixelCount}px)`;
        gapRatioDisplay.style.color = 'red';
        gapRatioDisplay.textContent = ` 致命的な隙間 (${greenPixelCount}px)`;
    }
}
}

// -------------------------------------------------------------------------

