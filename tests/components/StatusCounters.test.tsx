import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusCounters from "@/components/StatusCounters";

const counts = { NEW: 5, IN_PROGRESS: 3, CLOSED: 2 };

describe("StatusCounters", () => {
  it("renders all status labels", () => {
    render(<StatusCounters counts={counts} />);
    expect(screen.getByText(/Все/)).toBeInTheDocument();
    expect(screen.getByText(/Новые/)).toBeInTheDocument();
    expect(screen.getByText(/В работе/)).toBeInTheDocument();
    expect(screen.getByText(/Закрытые/)).toBeInTheDocument();
  });

  it("renders correct counts", () => {
    render(<StatusCounters counts={counts} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    render(<StatusCounters counts={counts} />);
    expect(screen.getByText(/Все/).closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText(/Новые/).closest("a")).toHaveAttribute("href", "/?status=NEW");
  });
});
