import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ClientForm from "@/components/ClientForm";

describe("ClientForm", () => {
  it("renders form title", () => {
    render(<ClientForm onCreated={vi.fn()} />);
    expect(screen.getByText(/Новый клиент/)).toBeInTheDocument();
  });

  it("renders all inputs", () => {
    render(<ClientForm onCreated={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Иванов/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/999/)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ClientForm onCreated={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Добавить клиента/ })).toBeInTheDocument();
  });
});
