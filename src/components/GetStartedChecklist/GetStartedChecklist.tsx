import { useAtom, useSetAtom } from "jotai";

import { Typography, Button } from "@mui/material";
import UncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckedIcon from "@mui/icons-material/CheckCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import MembersIcon from "@mui/icons-material/AccountCircleOutlined";

import Modal, { IModalProps } from "@src/components/Modal";
import SteppedAccordion from "@src/components/SteppedAccordion";
import GetStartedProgress from "./GetStartedProgress";

import {
  projectScope,
  getStartedChecklistAtom,
  tableSettingsDialogAtom,
} from "@src/atoms/projectScope";
import {
  NAV_DRAWER_WIDTH,
  NAV_DRAWER_COLLAPSED_WIDTH,
} from "@src/layouts/Navigation/NavDrawer";
import useGetStartedCompletion from "./useGetStartedCompletion";

export interface IGetStartedChecklistProps extends Partial<IModalProps> {
  navOpen: boolean;
  navPermanent: boolean;
}

export default function GetStartedChecklist({
  navOpen,
  navPermanent,
  ...props
}: IGetStartedChecklistProps) {
  const [open, setOpen] = useAtom(getStartedChecklistAtom, projectScope);
  const openTableSettingsDialog = useSetAtom(
    tableSettingsDialogAtom,
    projectScope
  );

  const [completedSteps] = useGetStartedCompletion();

  if (!open) return null;

  const incompleteIcon = <UncheckedIcon color="action" />;
  const completeIcon = (
    <CheckedIcon color="success" sx={{ color: "success.light" }} />
  );

  return (
    <Modal
      {...props}
      onClose={() => setOpen(false)}
      title="Get started"
      hideBackdrop
      maxWidth="xs"
      PaperProps={{ elevation: 8 }}
      fullScreen={false}
      sx={[
        {
          "& .MuiDialog-container": {
            justifyContent: "flex-start",
            alignItems: "flex-end",
          },

          "& .MuiDialog-paper": {
            marginLeft: {
              xs: `max(env(safe-area-inset-left), 8px)`,
              sm: `max(env(safe-area-inset-left), ${
                (navPermanent
                  ? navOpen
                    ? NAV_DRAWER_WIDTH
                    : NAV_DRAWER_COLLAPSED_WIDTH
                  : 0) + 8
              }px)`,
            },
            marginBottom: `max(env(safe-area-inset-bottom), 8px)`,
            marginRight: `max(env(safe-area-inset-right), 8px)`,
            width: 360,
          },
        },
      ]}
    >
      <GetStartedProgress sx={{ mb: 2 }} />

      <SteppedAccordion
        steps={[
          {
            id: "project",
            title: "Create a project",
            labelButtonProps: {
              icon: completedSteps.project ? completeIcon : incompleteIcon,
            },
            content: (
              <Typography paragraph>
                You’ve created a project and connected it to a data source.
              </Typography>
            ),
          },
          {
            id: "tutorial",
            title: "Complete the table tutorial",
            labelButtonProps: {
              icon: completedSteps.tutorial ? completeIcon : incompleteIcon,
            },
            content: (
              <>
                <Typography>
                  Learn the basic features and functions of Rowy before creating
                  a table.
                </Typography>
                <Button variant="contained" color="primary">
                  Begin tutorial
                </Button>
              </>
            ),
          },
          {
            id: "table",
            title: "Create a table",
            labelButtonProps: {
              icon: completedSteps.table ? completeIcon : incompleteIcon,
            },
            content: (
              <>
                <Typography>
                  Use tables to manage the data from your database in a
                  spreadsheet UI.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => openTableSettingsDialog({ open: true })}
                >
                  Create table
                </Button>
              </>
            ),
          },
          {
            id: "members",
            title: "Invite team members",
            labelButtonProps: {
              icon: completedSteps.members ? completeIcon : incompleteIcon,
            },
            content: (
              <>
                <Typography>
                  Collaborate on workspace projects by inviting your team
                  members. You can control their roles and access.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<MembersIcon />}
                >
                  Members
                </Button>
              </>
            ),
          },
        ]}
        sx={{
          "& .MuiStepConnector-root": {
            my: -10 / 8,
          },
          "& .Mui-active + .MuiStep-root:not(:last-of-type) .MuiStepContent-root":
            {
              mt: -10 / 8,
              pt: 10 / 8,
              mb: 10 / 8,
              pb: 2,
            },
          "& .MuiStepContent-root .MuiCollapse-wrapperInner > * + *": {
            mt: 1,
          },
        }}
      />
    </Modal>
  );
}
