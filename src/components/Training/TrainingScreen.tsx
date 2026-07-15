// FR-TRN-001/004/005: 訓練メニュー画面（Round2: 全ユーザー共通・パーソナライズなし）
import { getTrainingMenus, TRAINING_DISCLAIMER } from "../../services/trainingEngine";

// NFR-USE-002/003準拠: タップ領域44px以上・文字サイズ18px以上はCSSで担保する（styles.cssは別途Phase実装）
export function TrainingScreen() {
  const categories = getTrainingMenus();

  return (
    <section aria-label="訓練メニュー">
      <p role="note" style={{ fontSize: 18, fontWeight: "bold", padding: 12, border: "2px solid #c0392b" }}>
        {TRAINING_DISCLAIMER}
      </p>
      {categories.map((cat) => (
        <div key={cat.category}>
          <h2 style={{ fontSize: 20 }}>{cat.category}</h2>
          <ul>
            {cat.menus.map((menu) => (
              <li key={menu.menuId} style={{ fontSize: 18, marginBottom: 12 }}>
                <strong>{menu.title}</strong>
                <p>{menu.description}</p>
                <a href={menu.sourceUrl} target="_blank" rel="noreferrer">
                  参照元を見る
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
