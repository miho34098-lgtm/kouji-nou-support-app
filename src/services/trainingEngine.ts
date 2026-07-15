// C-06 TrainingEngine（Round2簡略化）: SDD.md §1。静的訓練メニュー(trainingMenus.json)の読込のみ。
// パーソナライズ・難易度調整ロジックは実装しない（ADR-006, ADR-007廃止, FR-TRN-005）。
import trainingMenusData from "../data/trainingMenus.json";

export interface TrainingMenuItem {
  menuId: string;
  title: string;
  description: string;
  sourceUrl: string;
}

export interface TrainingCategory {
  category: string;
  menus: TrainingMenuItem[];
}

/** FR-TRN-001: 全ユーザー共通の訓練メニュー一覧を返す。パーソナライズなし。 */
export function getTrainingMenus(): TrainingCategory[] {
  return trainingMenusData.categories;
}

// FR-TRN-004: 免責表示文言（Round2追記: 無理をしない旨・専門家への相談を促す旨を含む）
export const TRAINING_DISCLAIMER =
  "本アプリは医療機器ではなく、疾病の診断・治療・予防を目的としていません。訓練は医療従事者の指導の代替ではなく補助を目的としています。" +
  "無理に行わず、体調や気分に応じて休んでください。実施にあたって不安な点や、ご自身に合っているか分からない場合は、必ず主治医・作業療法士等の専門家にご相談ください。";
