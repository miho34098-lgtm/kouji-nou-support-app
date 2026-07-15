import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { db } from "../../../src/store/localStore";
import { ScheduleForm } from "../../../src/components/Schedule/ScheduleForm";

describe("<ScheduleForm /> (FR-NTF-001)", () => {
  beforeEach(async () => {
    await db.schedules.clear();
  });

  it("shows a validation error when submitting an empty title", async () => {
    const onCreated = vi.fn();
    render(<ScheduleForm userId="u1" onCreated={onCreated} />);
    await userEvent.click(screen.getByRole("button", { name: "追加する" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("タイトルを入力してください");
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("creates a schedule and calls onCreated when the title is filled in", async () => {
    const onCreated = vi.fn();
    render(<ScheduleForm userId="u1" onCreated={onCreated} />);
    await userEvent.type(screen.getByLabelText("タイトル"), "9:00 服薬");
    await userEvent.click(screen.getByRole("button", { name: "追加する" }));
    expect(onCreated).toHaveBeenCalledTimes(1);
    const stored = await db.schedules.where("userId").equals("u1").toArray();
    expect(stored).toHaveLength(1);
  });
});
