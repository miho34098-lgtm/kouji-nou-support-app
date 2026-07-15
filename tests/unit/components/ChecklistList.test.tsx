import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../../src/store/localStore";
import { createChecklistItem } from "../../../src/services/checklistManager";
import { ChecklistList } from "../../../src/components/Checklist/ChecklistList";

describe("<ChecklistList /> (FR-DATA-004)", () => {
  beforeEach(async () => {
    await db.checklistItems.clear();
    await db.checklistLogs.clear();
  });

  it("shows an empty state message when there are no items", () => {
    render(<ChecklistList items={[]} />);
    expect(screen.getByText("日課チェックリストはまだ登録されていません")).toBeInTheDocument();
  });

  it("toggles completion state when tapped (44px以上のボタン, NFR-USE-002)", async () => {
    const item = await createChecklistItem({ userId: "u1", title: "歯磨き", frequency: "毎日" });
    render(<ChecklistList items={[item]} />);
    const button = await screen.findByRole("button", { name: /歯磨き/ });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(button);
    expect(await screen.findByRole("button", { name: /歯磨き/ })).toHaveAttribute("aria-pressed", "true");
  });
});
