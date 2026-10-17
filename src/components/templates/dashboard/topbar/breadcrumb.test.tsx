import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";

import { Breadcrumb } from "./breadcrumb";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/es/cities/9ec06bc6-a32f-4b2a-8561-38335ce312c5/edit",
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderBreadcrumb() {
  return render(
    <NextIntlClientProvider
      locale="es"
      messages={{
        navigation: {
          home: "Inicio",
          breadcrumb: "Ruta de navegación",
          cities: "Ciudades",
          edit: "Editar",
        },
      }}
    >
      <Breadcrumb />
    </NextIntlClientProvider>
  );
}

describe("Breadcrumb", () => {
  it("renders current action segment as main label", () => {
    renderBreadcrumb();

    const headings = screen.getAllByText("Editar");
    expect(headings.length).toBeGreaterThan(0);
  });

  it("truncates UUID segments into clean #hash labels and renders interactive links", () => {
    renderBreadcrumb();

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Ciudades")).toBeInTheDocument();
    expect(screen.getByText("#9ec06bc6")).toBeInTheDocument();
  });
});
