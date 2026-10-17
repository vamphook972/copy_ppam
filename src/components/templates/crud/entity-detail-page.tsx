"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { getMenuIconComponent } from "@/config/icons.config";
import { Typography } from "@/components/atoms/typography";
import { DetailField } from "@/components/molecules/detail-field";
import { DetailHeaderCard } from "@/components/molecules/detail-header-card";
import { DetailSection } from "@/components/molecules/detail-section";
import { PageHeader } from "@/components/molecules/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BaseEntity,
  BaseQueryParams,
  CrudHooks,
  CrudModuleConfig,
} from "@/shared/types/crud-module.types";

export interface EntityDetailPageProps<
  TEntity extends BaseEntity & { name?: string; status?: string },
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
> {
  config: CrudModuleConfig<TEntity, TDto, TFormValues, TQueryParams, TColumnId>;
  hooks: CrudHooks<TEntity, TFormValues, TQueryParams>;
  id: string;
}

function renderTabIcon(icon: React.ComponentType<{ className?: string }> | string | undefined) {
  if (!icon) return null;
  if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
    const Component = icon as React.ComponentType<{ className?: string }>;
    return <Component className="h-4 w-4 shrink-0" />;
  }
  if (typeof icon === "string") {
    const Component = getMenuIconComponent(icon);
    return <Component className="h-4 w-4 shrink-0" />;
  }
  return null;
}

export function EntityDetailPage<
  TEntity extends BaseEntity & { name?: string; status?: string },
  TDto,
  TFormValues,
  TQueryParams extends BaseQueryParams = BaseQueryParams,
  TColumnId extends string = string,
>({
  config,
  hooks,
  id,
}: EntityDetailPageProps<TEntity, TDto, TFormValues, TQueryParams, TColumnId>) {
  const t = useTranslations(config.translationNamespace as Parameters<typeof useTranslations>[0]);

  const detailQuery = hooks.useDetail(id);

  if (detailQuery.isPending) {
    return (
      <main className="space-y-6">
        <Typography variant="body" className="text-muted-foreground">
          {t("states.loading" as Parameters<typeof t>[0])}
        </Typography>
      </main>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <main className="space-y-6">
        <Typography variant="h3">{t("states.errorTitle" as Parameters<typeof t>[0])}</Typography>
        <Typography variant="body" className="text-muted-foreground">
          {t("states.errorDescription" as Parameters<typeof t>[0])}
        </Typography>
      </main>
    );
  }

  const entity = detailQuery.data;
  const titleName = entity.name ?? entity.id;

  const isTabsMode = config.detail?.mode === "tabs";
  const sections = config.detail?.sections ?? [];
  const defaultTabValue = config.detail?.defaultTab ?? sections[0]?.id ?? "0";

  const editHref = config.permissions.update ? `${config.basePath}/${id}/edit` : undefined;
  const editLabel = t("actions.edit" as Parameters<typeof t>[0]);

  const renderSectionContent = (section: (typeof sections)[number], idx: number) => (
    <DetailSection
      key={idx}
      title={section.title ? t(section.title as Parameters<typeof t>[0]) : undefined}
      description={
        section.description ? t(section.description as Parameters<typeof t>[0]) : undefined
      }
      gridCols={section.gridCols ?? 2}
    >
      {section.renderCustom ? (
        <div className="col-span-full">{section.renderCustom(entity)}</div>
      ) : (
        section.fields?.map((field) => {
          const rawVal = (entity as Record<string, unknown>)[field.key as string];
          const renderedVal = field.render
            ? field.render(rawVal, entity)
            : (rawVal as React.ReactNode);

          return (
            <DetailField
              key={String(field.key)}
              label={t(field.label as Parameters<typeof t>[0])}
              value={renderedVal}
            />
          );
        })
      )}
    </DetailSection>
  );

  return (
    <main className="space-y-6">
      {/* Breadcrumb Navigation or Detail Header Banner */}
      {config.detail?.mode === "stack" ? (
        <PageHeader title={titleName} />
      ) : (
        <DetailHeaderCard
          entity={entity}
          headerConfig={config.detail?.header}
          editHref={editHref}
          editLabel={editLabel}
          translationNamespace={config.translationNamespace}
        />
      )}

      {/* Detail Body (Custom, Tabs or Stack) */}
      {config.detail?.renderDetail ? (
        config.detail.renderDetail(entity)
      ) : isTabsMode && sections.length > 0 ? (
        <Tabs defaultValue={defaultTabValue} className="space-y-6">
          <TabsList>
            {sections.map((section, idx) => {
              const tabValue = section.id ?? String(idx);
              const label = section.title
                ? t(section.title as Parameters<typeof t>[0])
                : `Section ${idx + 1}`;

              return (
                <TabsTrigger key={tabValue} value={tabValue}>
                  {renderTabIcon(section.icon)}
                  <span>{label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {sections.map((section, idx) => {
            const tabValue = section.id ?? String(idx);
            return (
              <TabsContent key={tabValue} value={tabValue}>
                {renderSectionContent(section, idx)}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <div className="space-y-6">
          {sections.map((section, idx) => renderSectionContent(section, idx))}
        </div>
      )}
    </main>
  );
}
