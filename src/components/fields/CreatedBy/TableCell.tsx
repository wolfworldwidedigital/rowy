import { useAtom } from "jotai";
import { IHeavyCellProps } from "@src/components/fields/types";

import { Tooltip, Stack, Avatar } from "@mui/material";

import { format } from "date-fns";
import { DATE_TIME_FORMAT } from "@src/constants/dates";
import { tableScope, tableSettingsAtom } from "@src/atoms/tableScope";

export default function CreatedBy({ row, column }: IHeavyCellProps) {
  const [tableSettings] = useAtom(tableSettingsAtom, tableScope);
  const value = row[tableSettings.auditFieldCreatedBy || "_createdBy"];

  if (!value || !value.displayName || !value.timestamp) return null;
  const dateLabel = format(
    value.timestamp.toDate ? value.timestamp.toDate() : value.timestamp,
    column.config?.format || DATE_TIME_FORMAT
  );

  return (
    <Tooltip title={`Created at ${dateLabel}`}>
      <Stack
        spacing={0.75}
        direction="row"
        alignItems="center"
        style={{ width: "100%" }}
      >
        <Avatar
          alt="Avatar"
          src={value.photoURL}
          sx={{ width: 20, height: 20, fontSize: "inherit" }}
        >
          {value.displayName[0]}
        </Avatar>
        <span>{value.displayName}</span>
      </Stack>
    </Tooltip>
  );
}