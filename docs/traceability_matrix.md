# トレーサビリティマトリクス

**【Round2見直し 2026-07-14】** FR-DATA-001/002, FR-TRN-002/003は廃止のため本表から削除。

| 要件ID | 設計コンポーネント | ADR | テストID | 状態 |
|---|---|---|---|---|
| FR-USR-001 | C-01 AuthService | ADR-008 | TC-USR-001 | 設計済 |
| FR-USR-002 | C-02 ProxyAccessManager | - | TC-USR-002 | 設計済 |
| FR-AUTH-001 | C-01 AuthService | ADR-008 | TC-AUTH-001 | 設計済 |
| FR-DATA-003 | C-05 ChecklistManager | - | TC-DATA-003 | 設計済 |
| FR-DATA-004 | C-05 ChecklistManager | CC-05 | TC-DATA-004 | 設計済 |
| FR-NTF-001 | C-04 ScheduleManager | - | TC-NTF-001 | 設計済 |
| FR-NTF-002 | CW-01 PushScheduler, C-07 NotificationClient | ADR-004, ADR-009 | TC-NTF-002 | 設計済 |
| FR-NTF-003 | C-04 ScheduleManager | - | TC-NTF-003 | 設計済 |
| FR-NTF-004 | C-07 NotificationClient | - | TC-NTF-004 | 設計済 |
| FR-ADM-001 | C-02 ProxyAccessManager | - | TC-ADM-001 | 設計済 |
| FR-ADM-002 | C-02 ProxyAccessManager | - | TC-ADM-002 | 設計済 |
| FR-TRN-001（Round2簡略化） | C-06 TrainingEngine | ADR-006 | TC-TRN-001 | 設計済 |
| FR-TRN-004 | UI(Training画面) | ADR-006 | TC-TRN-004 | 設計済 |
| FR-TRN-005 | C-06 TrainingEngine | ADR-006 | TC-TRN-005 | 設計済 |
| FR-SYS-001 | C-08 PWAShell | ADR-001 | TC-SYS-001 | 設計済 |
| FR-SYS-002 | C-08 PWAShell | - | TC-SYS-002 | 設計済 |
| FR-SYS-003 | C-09 SyncEngine, C-10 LocalStore | ADR-002 | TC-SYS-003 | 設計済 |
| FR-SYS-004 | C-09 SyncEngine | ADR-002 | TC-SYS-004 | 設計済 |
| NFR-FUNC-001 | 全コンポーネント | - | TC-NFR-001 | 設計済 |
| NFR-PERF-001 | C-08 PWAShell（配信最適化） | ADR-003 | TC-NFR-002 | 設計済 |
| NFR-PERF-002 | CW-01 PushScheduler | ADR-004 | TC-NFR-003 | 設計済 |
| NFR-COMP-001 | C-08 PWAShell | - | TC-NFR-004 | 設計済 |
| NFR-USE-001〜003 | UIコンポーネント全般 | - | TC-NFR-005〜007 | 設計済 |
| NFR-REL-001 | C-09 SyncEngine, C-10 LocalStore | ADR-002 | TC-NFR-008 | 設計済 |
| NFR-SEC-001 | C-01 AuthService | ADR-008 | TC-NFR-009 | 設計済 |
| NFR-SEC-002 | 全通信層（HTTPS強制） | - | TC-NFR-010 | 設計済 |
| ~~NFR-SEC-003~~ | - | - | - | **廃止(Round2)** |
| NFR-MAINT-001 | 全コンポーネント（単体テスト） | - | TC-NFR-012 | 設計済 |
| NFR-PORT-001 | ビルド構成（Vite） | ADR-001 | TC-NFR-013 | 設計済 |
| NFR-EXT-001 | C-06 TrainingEngine（trainingMenus.json） | ADR-006 | TC-NFR-014 | 設計済 |

**未接続要件**: なし（全FR/NFRが設計コンポーネントに接続済み）
