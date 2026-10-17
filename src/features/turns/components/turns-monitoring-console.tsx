"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Filter, UserPlus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { citiesModule } from "@/features/cities";
import { placesModule } from "@/features/places";
import { User } from "@/features/users/types/user";
import { zonesModule } from "@/features/zones";
import { Button } from "@/components/atoms/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { notify } from "@/shared/utils/notify";

import { turnsMonitoringApi } from "../api/turns-monitoring.api";
import { ScheduledTurnMonitoringDto } from "../types/turn";
import { ConfirmAssignmentModal } from "./confirm-assignment-modal";
import { DailyMonitoringGrid } from "./daily-monitoring-grid";
import { MonitoringLegend } from "./monitoring-legend";
import { VolunteersDrawer } from "./volunteers-drawer";
import { WeeklyMonitoringGrid } from "./weekly-monitoring-grid";

export function TurnsMonitoringConsole() {
  const t = useTranslations("turns");
  const queryClient = useQueryClient();

  // Mode: "daily" (default) or "weekly"
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  // Filters state
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cityId, setCityId] = useState<string>("");
  const [zoneId, setZoneId] = useState<string>("");
  const [placeId, setPlaceId] = useState<string>("");

  // Drawer and Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTurnForAssignment, setSelectedTurnForAssignment] =
    useState<ScheduledTurnMonitoringDto | null>(null);
  const [selectedVolunteerForAssignment, setSelectedVolunteerForAssignment] = useState<User | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Mutation for assigning volunteer to shift
  const assignMutation = useMutation({
    mutationFn: (params: {
      shiftId: string;
      participantId: string;
      isRecurring?: boolean;
      endDate?: string | null;
    }) => turnsMonitoringApi.assignParticipant(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["turns-monitoring-daily"] });
      queryClient.invalidateQueries({ queryKey: ["turns-monitoring-weekly"] });
      queryClient.invalidateQueries({ queryKey: ["participant-turn-counts"] });
      setIsConfirmModalOpen(false);
      setSelectedVolunteerForAssignment(null);

      if (data?.skippedDates && data.skippedDates.length > 0) {
        notify.info(
          t("assignment.recurringConflictMessage", {
            count: data.skippedDates.length,
            dates: data.skippedDates.join(", "),
          })
        );
      } else {
        notify.success(t("assignment.recurringSuccess"));
      }
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        error?.response?.data?.message || error?.message || t("assignment.errorDefault");
      notify.error(message);
    },
  });

  // Data queries for dropdowns
  const citiesQuery = citiesModule.hooks.useList({ pageSize: 200, status: "ACTIVE" });
  const zonesQuery = zonesModule.hooks.useList({ pageSize: 200, status: "ACTIVE" });
  const placesQuery = placesModule.hooks.useList({ pageSize: 200, status: "ACTIVE" });

  // Combobox Options Mapping
  const cityOptions: ComboboxOption[] = useMemo(() => {
    return (citiesQuery.data?.items || []).map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [citiesQuery.data?.items]);

  // Filtered zones based on selected city (si no hay ciudad seleccionada, muestra todas las zonas)
  const filteredZones = useMemo(() => {
    const items = zonesQuery.data?.items || [];
    if (!cityId) return items;
    return items.filter((z) => z.cityId === cityId);
  }, [zonesQuery.data?.items, cityId]);

  const zoneOptions: ComboboxOption[] = useMemo(() => {
    return filteredZones.map((z) => ({
      value: z.id,
      label: z.name,
    }));
  }, [filteredZones]);

  // Filtered places based on selected zone or city (si no hay zona ni ciudad, muestra todos los lugares)
  const filteredPlaces = useMemo(() => {
    const items = placesQuery.data?.items || [];
    if (zoneId) {
      return items.filter((p) => p.zoneId === zoneId);
    }
    if (cityId) {
      return items.filter((p) => p.cityId === cityId);
    }
    return items;
  }, [placesQuery.data?.items, zoneId, cityId]);

  const placeOptions: ComboboxOption[] = useMemo(() => {
    return filteredPlaces.map((p) => ({
      value: p.id,
      label: p.name,
    }));
  }, [filteredPlaces]);

  // Non-blocking Handlers
  const handleCityChange = (newCityId: string) => {
    setCityId(newCityId);
    // Si la zona actual ya no pertenece a la nueva ciudad, la reseteamos
    if (newCityId && zoneId) {
      const selectedZone = zonesQuery.data?.items.find((z) => z.id === zoneId);
      if (selectedZone && selectedZone.cityId !== newCityId) {
        setZoneId("");
        setPlaceId("");
      }
    }
  };

  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    if (newZoneId) {
      // Auto-seleccionar ciudad si no estaba seleccionada
      const selectedZone = zonesQuery.data?.items.find((z) => z.id === newZoneId);
      if (selectedZone && !cityId) {
        setCityId(selectedZone.cityId);
      }
      // Resetear lugar si no pertenece a la zona seleccionada
      if (placeId) {
        const selectedPlace = placesQuery.data?.items.find((p) => p.id === placeId);
        if (selectedPlace && selectedPlace.zoneId !== newZoneId) {
          setPlaceId("");
        }
      }
    }
  };

  const handlePlaceChange = (newPlaceId: string) => {
    setPlaceId(newPlaceId);
    if (newPlaceId) {
      const selectedPlace = placesQuery.data?.items.find((p) => p.id === newPlaceId);
      if (selectedPlace) {
        if (!zoneId && selectedPlace.zoneId) {
          setZoneId(selectedPlace.zoneId);
        }
        if (!cityId && selectedPlace.cityId) {
          setCityId(selectedPlace.cityId);
        }
      }
    }
  };

  // Daily Query
  const dailyQuery = useQuery({
    queryKey: ["turns-monitoring-daily", shiftDate, cityId, zoneId, placeId],
    queryFn: () =>
      turnsMonitoringApi.getDailyGrid({
        shiftDate,
        cityId: cityId || undefined,
        zoneId: zoneId || undefined,
        placeId: placeId || undefined,
      }),
    enabled: viewMode === "daily",
  });

  // Calculate week range for weekly query
  const { fromDate, toDate } = React.useMemo(() => {
    const d = new Date(`${shiftDate}T00:00:00Z`);
    const day = d.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    return {
      fromDate: monday.toISOString().slice(0, 10),
      toDate: sunday.toISOString().slice(0, 10),
    };
  }, [shiftDate]);

  // Weekly Query
  const weeklyQuery = useQuery({
    queryKey: ["turns-monitoring-weekly", placeId, fromDate, toDate],
    queryFn: () =>
      turnsMonitoringApi.getPlaceWeeklyGrid({
        placeId,
        fromDate,
        toDate,
      }),
    enabled: viewMode === "weekly" && !!placeId,
  });

  // Date Navigation Helpers
  const handleToday = () => {
    setShiftDate(new Date().toISOString().slice(0, 10));
  };

  const handlePrevDate = () => {
    const d = new Date(`${shiftDate}T00:00:00Z`);
    if (viewMode === "daily") {
      d.setUTCDate(d.getUTCDate() - 1);
    } else {
      d.setUTCDate(d.getUTCDate() - 7);
    }
    setShiftDate(d.toISOString().slice(0, 10));
  };

  const handleNextDate = () => {
    const d = new Date(`${shiftDate}T00:00:00Z`);
    if (viewMode === "daily") {
      d.setUTCDate(d.getUTCDate() + 1);
    } else {
      d.setUTCDate(d.getUTCDate() + 7);
    }
    setShiftDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className={`space-y-6 transition-all duration-300 ${isDrawerOpen ? "lg:pr-84" : ""}`}>
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>

        {/* Action Controls: Search Volunteers & Mode Switcher */}
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 text-xs font-semibold">
            <UserPlus className="h-4 w-4" />
            {t("volunteers.openDrawerButton")}
          </Button>

          {/* Navigation Mode Switcher */}
          <div className="bg-muted flex items-center rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setViewMode("daily")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "daily"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("views.daily")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("weekly")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "weekly"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("views.weekly")}
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters & Date Navigator */}
      <div className="bg-card space-y-4 rounded-xl border p-4 shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
          {/* Date Navigator Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevDate}
              title={t("monitoring.previous")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="bg-background flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold shadow-2xs">
              <Calendar className="text-primary h-4 w-4 shrink-0" />
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="cursor-pointer bg-transparent focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDate}
              title={t("monitoring.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs">
              {t("monitoring.today")}
            </Button>
          </div>

          {/* Context Display for Date Range */}
          {viewMode === "weekly" && (
            <div className="text-muted-foreground text-xs font-medium">
              {t.rich("monitoring.weekRange", {
                bold: (chunks) => <span className="text-foreground font-semibold">{chunks}</span>,
                fromDate,
                toDate,
              })}
            </div>
          )}
        </div>

        {/* Location Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-muted-foreground mb-1 block flex items-center gap-1 text-xs font-medium">
              <Filter className="h-3 w-3" />
              {t("monitoring.cityFilter")}
            </label>
            <Combobox
              options={cityOptions}
              value={cityId}
              onValueChange={handleCityChange}
              placeholder={t("monitoring.cityPlaceholder")}
              searchPlaceholder="Buscar ciudad..."
              emptyMessage="No se encontraron ciudades."
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block flex items-center gap-1 text-xs font-medium">
              <Filter className="h-3 w-3" />
              {t("monitoring.zoneFilter")}
            </label>
            <Combobox
              options={zoneOptions}
              value={zoneId}
              onValueChange={handleZoneChange}
              placeholder={t("monitoring.zonePlaceholder")}
              searchPlaceholder="Buscar zona..."
              emptyMessage="No se encontraron zonas."
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block flex items-center gap-1 text-xs font-medium">
              <Filter className="h-3 w-3" />
              {t("monitoring.placeFilter")}
            </label>
            <Combobox
              options={placeOptions}
              value={placeId}
              onValueChange={handlePlaceChange}
              placeholder={t("monitoring.placePlaceholder")}
              searchPlaceholder="Buscar punto PPAM..."
              emptyMessage="No se encontraron puntos."
            />
          </div>
        </div>
      </div>

      {/* Main Monitoring View Content */}
      {viewMode === "daily" ? (
        <DailyMonitoringGrid
          turns={dailyQuery.data || []}
          isLoading={dailyQuery.isLoading}
          onDropVolunteer={(turn, volunteer) => {
            setSelectedTurnForAssignment(turn);
            setSelectedVolunteerForAssignment(volunteer);
            setIsConfirmModalOpen(true);
          }}
          onSelectTurn={(turn) => {
            setSelectedTurnForAssignment(turn);
            if (selectedVolunteerForAssignment) {
              setIsConfirmModalOpen(true);
            } else {
              setIsDrawerOpen(true);
            }
          }}
        />
      ) : !placeId ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
          {t("monitoring.selectPlaceForWeeklyView")}
        </div>
      ) : (
        <WeeklyMonitoringGrid
          turns={weeklyQuery.data || []}
          isLoading={weeklyQuery.isLoading}
          onDropVolunteer={(turn, volunteer) => {
            setSelectedTurnForAssignment(turn);
            setSelectedVolunteerForAssignment(volunteer);
            setIsConfirmModalOpen(true);
          }}
          onSelectTurn={(turn) => {
            setSelectedTurnForAssignment(turn);
            if (selectedVolunteerForAssignment) {
              setIsConfirmModalOpen(true);
            } else {
              setIsDrawerOpen(true);
            }
          }}
        />
      )}

      {/* Traffic Light Legend */}
      <MonitoringLegend />

      {/* Drawer de Voluntarios */}
      <VolunteersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectVolunteer={(volunteer) => {
          setSelectedVolunteerForAssignment(volunteer);
          if (selectedTurnForAssignment) {
            setIsConfirmModalOpen(true);
          }
        }}
      />

      {/* Modal de Confirmación de Asignación Manual / Drag & Drop */}
      <ConfirmAssignmentModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedVolunteerForAssignment(null);
        }}
        isSubmitting={assignMutation.isPending}
        onConfirm={async (options) => {
          if (selectedTurnForAssignment && selectedVolunteerForAssignment) {
            await assignMutation.mutateAsync({
              shiftId: selectedTurnForAssignment.shiftId,
              participantId: selectedVolunteerForAssignment.id,
              isRecurring: options.isRecurring,
              endDate: options.endDate,
            });
          }
        }}
        volunteer={selectedVolunteerForAssignment}
        turn={selectedTurnForAssignment}
      />
    </div>
  );
}
