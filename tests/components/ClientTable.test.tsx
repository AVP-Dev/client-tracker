import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ClientTable from "@/components/ClientTable";
import { Status } from "@prisma/client";

const mockClients = [
  { id: 1, name: "Иванов", phone: "+79991234567", notes: "Заметка", status: "NEW" as Status, createdAt: "2025-01-15T00:00:00Z" },
  { id: 2, name: "Петрова", phone: "+79999876543", notes: "", status: "IN_PROGRESS" as Status, createdAt: "2025-01-10T00:00:00Z" },
];

const onChanged = vi.fn();

describe("ClientTable", () => {
  it("renders clients", () => {
    render(<ClientTable clients={mockClients} onChanged={onChanged} />);
    expect(screen.getByText("Иванов")).toBeInTheDocument();
    expect(screen.getByText("Петрова")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<ClientTable clients={[]} onChanged={onChanged} />);
    expect(screen.getByText(/Клиентов пока нет/)).toBeInTheDocument();
  });

  it("renders edit and delete buttons", () => {
    render(<ClientTable clients={mockClients} onChanged={onChanged} />);
    expect(screen.getAllByTitle("Редактировать")).toHaveLength(2);
    expect(screen.getAllByTitle("Удалить")).toHaveLength(2);
  });

  it("renders status selects", () => {
    render(<ClientTable clients={mockClients} onChanged={onChanged} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2);
  });

  it("renders notes indicator", () => {
    render(<ClientTable clients={mockClients} onChanged={onChanged} />);
    // Client 1 has notes → shows 📝, client 2 has no notes → no 📝
    const notesButtons = screen.getAllByText("📝");
    expect(notesButtons).toHaveLength(1);
  });
});
