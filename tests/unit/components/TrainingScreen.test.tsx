import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrainingScreen } from "../../../src/components/Training/TrainingScreen";

describe("<TrainingScreen /> (FR-TRN-001, FR-TRN-004)", () => {
  it("renders the disclaimer and all 3 categories", () => {
    render(<TrainingScreen />);
    expect(screen.getByText(/無理に行わず/)).toBeInTheDocument();
    expect(screen.getByText(/専門家にご相談ください/)).toBeInTheDocument();
    expect(screen.getByText("記憶訓練")).toBeInTheDocument();
    expect(screen.getByText("注意訓練")).toBeInTheDocument();
    expect(screen.getByText("遂行機能訓練")).toBeInTheDocument();
  });
});
