import useSWR from "swr";
import _find from "lodash/find";
import _sortBy from "lodash/sortBy";
import { useSnackbar } from "notistack";

import { DialogContentText, Stack, Typography } from "@mui/material";

import { FormDialog, FormFields } from "@rowy/form-builder";
import { tableSettings } from "./form";
import CamelCaseId from "./CamelCaseId";
import SuggestedRules from "./SuggestedRules";
import SteppedAccordion from "@src/components/SteppedAccordion";
import ActionsMenu from "./ActionsMenu";
import DeleteMenu from "./DeleteMenu";

import { useProjectContext, Table } from "@src/contexts/ProjectContext";
import useRouter from "@src/hooks/useRouter";
import { useConfirmation } from "@src/components/ConfirmationDialog";
import { useSnackLogContext } from "@src/contexts/SnackLogContext";
import { runRoutes } from "@src/constants/runRoutes";
import { analytics } from "@src/analytics";
import {
  CONFIG,
  TABLE_GROUP_SCHEMAS,
  TABLE_SCHEMAS,
} from "@src/config/dbPaths";

export enum TableSettingsDialogModes {
  create,
  update,
}
export interface ICreateTableDialogProps {
  mode: TableSettingsDialogModes | null;
  clearDialog: () => void;
  data: Table | null;
}

export default function TableSettings({
  mode,
  clearDialog,
  data,
}: ICreateTableDialogProps) {
  const { settingsActions, roles, tables, rowyRun } = useProjectContext();
  const sectionNames = Array.from(
    new Set((tables ?? []).map((t) => t.section))
  );

  const router = useRouter();
  const { requestConfirmation } = useConfirmation();
  const snackLogContext = useSnackLogContext();
  const { enqueueSnackbar } = useSnackbar();

  const { data: collections } = useSWR(
    "firebaseCollections",
    () => rowyRun?.({ route: runRoutes.listCollections }),
    { fallbackData: [], revalidateIfStale: false, dedupingInterval: 60_000 }
  );

  const open = mode !== null;

  if (!open) return null;

  const handleSubmit = async (v) => {
    const { _suggestedRules, ...values } = v;
    const data: any = { ...values };

    if (values.schemaSource)
      data.schemaSource = _find(tables, { id: values.schemaSource });

    const hasExtensions = Boolean(_get(data, "_schema.extensionObjects"));
    const hasWebhooks = Boolean(_get(data, "_schema.webhooks"));
    const deployExtensionsWebhooks = (onComplete?: () => void) => {
      if (rowyRun && (hasExtensions || hasWebhooks)) {
        requestConfirmation({
          title: `Deploy ${[
            hasExtensions && "extensions",
            hasWebhooks && "webhooks",
          ]
            .filter(Boolean)
            .join(" and ")}?`,
          body: "You can also deploy later from the table page",
          confirm: "Deploy",
          cancel: "Later",
          handleConfirm: async () => {
            const tablePath = data.collection;
            const tableConfigPath = `${
              data.tableType !== "collectionGroup"
                ? TABLE_SCHEMAS
                : TABLE_GROUP_SCHEMAS
            }/${data.id}`;

            if (hasExtensions) {
              snackLogContext.requestSnackLog();
              rowyRun({
                route: runRoutes.buildFunction,
                body: {
                  tablePath,
                  pathname: `/${
                    data.tableType === "collectionGroup"
                      ? "tableGroup"
                      : "table"
                  }/${data.id}`,
                  tableConfigPath,
                },
              });
              analytics.logEvent("deployed_extensions");
            }

            if (hasWebhooks) {
              const resp = await rowyRun({
                service: "hooks",
                route: runRoutes.publishWebhooks,
                body: {
                  tableConfigPath,
                  tablePath,
                },
              });
              enqueueSnackbar(resp.message, {
                variant: resp.success ? "success" : "error",
              });
              analytics.logEvent("published_webhooks");
            }

            if (onComplete) onComplete();
          },
        });
      } else {
        if (onComplete) onComplete();
      }
    };

    if (mode === TableSettingsDialogModes.update) {
      await settingsActions?.updateTable(data);
      deployExtensionsWebhooks();
      clearDialog();
    } else {
      await settingsActions?.createTable(data);
      deployExtensionsWebhooks(() => {
        if (router.location.pathname === "/") {
          router.history.push(
            `${
              values.tableType === "collectionGroup" ? "tableGroup" : "table"
            }/${values.id}`
          );
        } else {
          router.history.push(values.id);
        }
        clearDialog();
      });
    }
    analytics.logEvent(
      TableSettingsDialogModes.update ? "update_table" : "create_table",
      { type: values.tableType }
    );
  };

  const fields = tableSettings(
    mode,
    roles,
    sectionNames,
    _sortBy(
      tables?.map((table) => ({
        label: table.name,
        value: table.id,
        section: table.section,
        collection: table.collection,
      })),
      ["section", "label"]
    ),
    Array.isArray(collections) ? collections.filter((x) => x !== CONFIG) : []
  );
  const customComponents = {
    camelCaseId: {
      component: CamelCaseId,
      defaultValue: "",
      validation: [["string"]],
    },
    suggestedRules: {
      component: SuggestedRules,
      defaultValue: "",
      validation: [["string"]],
    },
  };

  return (
    <FormDialog
      onClose={clearDialog}
      title={
        mode === TableSettingsDialogModes.create
          ? "Create table"
          : "Table settings"
      }
      fields={fields}
      customBody={(formFieldsProps) => (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: "flex",
              height: "var(--dialog-title-height)",
              alignItems: "center",

              position: "absolute",
              top: 0,
              right: 40 + 12 + 8,
            }}
          >
            {mode === TableSettingsDialogModes.update && (
              <DeleteMenu clearDialog={clearDialog} data={data} />
            )}
          </Stack>

          <SteppedAccordion
            disableUnmount
            steps={
              [
                {
                  id: "collection",
                  title: "Collection",
                  content: (
                    <>
                      <DialogContentText paragraph>
                        Connect this table to a new or existing Firestore
                        collection
                      </DialogContentText>
                      <FormFields
                        {...formFieldsProps}
                        fields={fields.filter((f) => f.step === "collection")}
                      />
                    </>
                  ),
                  optional: false,
                },
                {
                  id: "display",
                  title: "Display",
                  content: (
                    <>
                      <DialogContentText paragraph>
                        Set how this table is displayed to users
                      </DialogContentText>
                      <FormFields
                        {...formFieldsProps}
                        fields={fields.filter((f) => f.step === "display")}
                        customComponents={customComponents}
                      />
                    </>
                  ),
                  optional: false,
                },
                {
                  id: "accessControls",
                  title: "Access controls",
                  content: (
                    <>
                      <DialogContentText paragraph>
                        Set who can view and edit this table. Only ADMIN users
                        can edit table settings or add, edit, and delete
                        columns.
                      </DialogContentText>
                      <FormFields
                        {...formFieldsProps}
                        fields={fields.filter(
                          (f) => f.step === "accessControls"
                        )}
                        customComponents={customComponents}
                      />
                    </>
                  ),
                  optional: false,
                },
                {
                  id: "auditing",
                  title: "Auditing",
                  content: (
                    <>
                      <DialogContentText paragraph>
                        Track when users create or update rows
                      </DialogContentText>
                      <FormFields
                        {...formFieldsProps}
                        fields={fields.filter((f) => f.step === "auditing")}
                      />
                    </>
                  ),
                  optional: true,
                },
                mode === TableSettingsDialogModes.create
                  ? {
                      id: "columns",
                      title: "Columns",
                      content: (
                        <>
                          <DialogContentText paragraph>
                            Initialize table with columns
                          </DialogContentText>
                          <FormFields
                            {...formFieldsProps}
                            fields={fields.filter((f) => f.step === "columns")}
                          />
                        </>
                      ),
                      optional: true,
                    }
                  : null,
              ].filter(Boolean) as any
            }
          />
        </>
      )}
      customComponents={customComponents}
      values={{ ...data }}
      onSubmit={handleSubmit}
      SubmitButtonProps={{
        children:
          mode === TableSettingsDialogModes.create ? "Create" : "Update",
      }}
    />
  );
}
