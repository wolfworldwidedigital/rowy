import { lazy, Suspense } from "react";
import { ISettingsProps } from "../types";

import { Grid, InputLabel } from "@mui/material";
import MultiSelect from "@rowy/multiselect";
import FieldSkeleton from "components/SideDrawer/Form/FieldSkeleton";
import FieldsDropdown from "components/Table/ColumnMenu/FieldsDropdown";
import CodeEditorHelper from "@src/components/CodeEditor/CodeEditorHelper";

import { FieldType } from "constants/fields";
import { useProjectContext } from "contexts/ProjectContext";
import { WIKI_LINKS } from "constants/externalLinks";

const CodeEditor = lazy(
  () => import("components/CodeEditor" /* webpackChunkName: "CodeEditor" */)
);

export default function Settings({
  config,
  handleChange,
  fieldName,
}: ISettingsProps) {
  const { tableState } = useProjectContext();
  if (!tableState?.columns) return <></>;
  const columnOptions = Object.values(tableState.columns)
    .filter((column) => column.fieldName !== fieldName)
    .filter((column) => column.type !== FieldType.subTable)
    .map((c) => ({ label: c.name, value: c.key }));

  return (
    <>
      <Grid container direction="row" spacing={2} flexWrap="nowrap">
        <Grid item xs={12} md={6}>
          <MultiSelect
            label="Listener fields"
            options={columnOptions}
            value={config.listenerFields ?? []}
            onChange={handleChange("listenerFields")}
            TextFieldProps={{
              helperText:
                "Changes to these fields will trigger the evaluation of the column.",
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FieldsDropdown
            label="Output field type"
            value={config.renderFieldType}
            options={Object.values(FieldType).filter(
              (f) =>
                ![
                  FieldType.derivative,
                  FieldType.aggregate,
                  FieldType.subTable,
                  FieldType.action,
                ].includes(f)
            )}
            onChange={(value) => {
              handleChange("renderFieldType")(value);
            }}
          />
        </Grid>
      </Grid>

      <div>
        <InputLabel>Derivative script</InputLabel>
        <CodeEditorHelper docLink={WIKI_LINKS.fieldTypesDerivative} />
        <Suspense fallback={<FieldSkeleton height={200} />}>
          <CodeEditor value={config.script} onChange={handleChange("script")} />
        </Suspense>
      </div>
    </>
  );
}
