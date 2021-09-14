import { useState, Suspense, useMemo, createElement } from "react";
import { useSnackbar } from "notistack";

import _set from "lodash/set";
import { IMenuModalProps } from "..";

import Modal from "components/Modal";
import { getFieldProp } from "components/fields";
import DefaultValueInput from "./DefaultValueInput";
import ErrorBoundary from "components/ErrorBoundary";
import Loading from "components/Loading";

import { useProjectContext } from "contexts/ProjectContext";
import { useSnackLogContext } from "contexts/SnackLogContext";
import { db } from "../../../../firebase";
import { useAppContext } from "contexts/AppContext";
import { useConfirmation } from "components/ConfirmationDialog";
import { FieldType } from "constants/fields";

import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import routes from "constants/routes";
import { SETTINGS } from "config/dbPaths";
import { name as appName } from "@root/package.json";
import { RunRoutes } from "@src/constants/runRoutes";

export default function FieldSettings(props: IMenuModalProps) {
  const { name, fieldName, type, open, config, handleClose, handleSave } =
    props;

  const [showRebuildPrompt, setShowRebuildPrompt] = useState(false);
  const [newConfig, setNewConfig] = useState(config ?? {});
  const customFieldSettings = getFieldProp("settings", type);
  const initializable = getFieldProp("initializable", type);

  const { requestConfirmation } = useConfirmation();
  const { enqueueSnackbar } = useSnackbar();
  const { tableState, rowyRun } = useProjectContext();
  const snackLog = useSnackLogContext();
  const appContext = useAppContext();

  const handleChange = (key: string) => (update: any) => {
    if (
      showRebuildPrompt === false &&
      (key.includes("defaultValue") || type === FieldType.derivative) &&
      config[key] !== update
    ) {
      setShowRebuildPrompt(true);
    }
    console.log(key, update);
    const updatedConfig = _set({ ...newConfig }, key, update);
    setNewConfig(updatedConfig);
  };
  const rendedFieldSettings = useMemo(
    () =>
      [FieldType.derivative, FieldType.aggregate].includes(type) &&
      newConfig.renderFieldType
        ? getFieldProp("settings", newConfig.renderFieldType)
        : null,
    [newConfig.renderFieldType, type]
  );
  if (!open) return null;
  console.log(newConfig);
  return (
    <Modal
      maxWidth="md"
      onClose={handleClose}
      title={`${name}: Settings`}
      children={
        <Suspense fallback={<Loading fullScreen={false} />}>
          <>
            {initializable && (
              <>
                <section style={{ marginTop: 1 }}>
                  {/* top margin fixes visual bug */}
                  <ErrorBoundary fullScreen={false}>
                    <DefaultValueInput
                      handleChange={handleChange}
                      {...props}
                      config={newConfig}
                    />
                  </ErrorBoundary>
                </section>
              </>
            )}

            <section>
              {customFieldSettings &&
                createElement(customFieldSettings, {
                  config: newConfig,
                  handleChange,
                })}
            </section>
            {rendedFieldSettings && (
              <section>
                <Divider />
                <Typography variant="overline">
                  Rendered field config
                </Typography>
                {createElement(rendedFieldSettings, {
                  config: newConfig,
                  handleChange,
                })}
              </section>
            )}
            {/* {
            <ConfigForm
              type={type}
              
              config={newConfig}
            />
          } */}
          </>
        </Suspense>
      }
      actions={{
        primary: {
          onClick: () => {
            if (showRebuildPrompt) {
              requestConfirmation({
                title: "Deploy Changes",
                body: "You have made changes that affect the behavior of the cloud function of this table, Would you like to redeploy it now?",
                confirm: "Deploy",
                cancel: "Later",
                handleConfirm: async () => {
                  if (!rowyRun) return;
                  rowyRun({
                    route: RunRoutes.buildFunction,
                    body: {
                      triggerPath: "demoAllFieldTypes/{docId}",
                      // configPath: tableState?.config.tableConfig.path,
                    },
                    params: [],
                  });
                },
              });
            }
            handleSave(fieldName, { config: newConfig });
            handleClose();
            setShowRebuildPrompt(false);
          },
          children: "Update",
        },
        secondary: {
          onClick: handleClose,
          children: "Cancel",
        },
      }}
    />
  );
}
