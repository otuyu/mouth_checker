#口の中の画像取得
#あ、い、う、え、おの口の形取得（透過画像）
#口の形前にしてパララックス

from flask import Flask, render_template

app = Flask(__name__)

# 各画像のファイル名と、パララックスの「強さ」（移動速度）を定義します。
# 値が大きいほど、マウスの動きに対する反応が大きく（速く）なります。
# 順番は奥から手前になるように並べ替えます。
# 口内の画像（一番奥）の速度は「0」または非常に小さな値にします。

IMAGE_LAYERS = [
    {"name": "mouth_inside.jpg", "speed": 0.05, "z_index": 1}, # 一番奥
    {"name": "mouth_o.png", "speed": 0.1, "z_index": 2},
    {"name": "mouth_u.png", "speed": 0.1, "z_index": 3},
    {"name": "mouth_e.png", "speed": 0.1, "z_index": 4},
    {"name": "mouth_i.png", "speed": 0.1, "z_index": 5},
    {"name": "mouth_a.png", "speed": 0.1, "z_index": 6}, # 一番手前
]

@app.route('/')
def index():
    # HTMLテンプレートにレイヤー情報を渡します
    return render_template('index.html', layers=IMAGE_LAYERS)

if __name__ == '__main__':
    # デバッグモードでアプリケーションを実行します
    app.run(debug=True)
