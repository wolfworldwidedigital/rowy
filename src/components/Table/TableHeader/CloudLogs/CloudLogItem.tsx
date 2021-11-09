import { format } from "date-fns";
import _get from "lodash/get";
import ReactJson from "react-json-view";
import { struct } from "pb-util";
import stringify from "json-stable-stringify-without-jsonify";

import {
  styled,
  useTheme,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Stack,
  Chip as MuiChip,
  ChipProps,
  Typography,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudLogSeverityIcon from "./CloudLogSeverityIcon";

import { DATE_FORMAT, TIME_FORMAT } from "@src/constants/dates";

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  background: "none",
  marginTop: 0,
  "&::before": { display: "none" },

  ...theme.typography.caption,
  fontFamily: theme.typography.fontFamilyMono,
}));

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  minHeight: 32,
  alignItems: "flex-start",

  "&.Mui-expanded": {
    backgroundColor: theme.palette.action.hover,
    "&:hover": { backgroundColor: theme.palette.action.selected },
    "&.Mui-focusVisible": {
      backgroundColor: theme.palette.action.disabledBackground,
    },
  },

  "& svg": {
    fontSize: 18,
    height: 20,
  },

  "& .MuiAccordionSummary-content, & .MuiAccordionSummary-expandIconWrapper": {
    marginTop: (32 - 20) / 2,
    marginBottom: (32 - 20) / 2,
  },

  "& .MuiAccordionSummary-content": {
    overflow: "hidden",
    paddingRight: theme.spacing(1),
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(0.5, 2),
    "& > *": { flexShrink: 0 },

    [theme.breakpoints.down("lg")]: {
      flexWrap: "wrap",
      paddingLeft: theme.spacing(18 / 8 + 2),
      "& > :first-child": { marginLeft: theme.spacing((18 / 8 + 2) * -1) },
    },
  },

  "& .log-preview": {
    flexShrink: 1,

    // ".Mui-expanded&": {
    //   overflow: "visible",
    //   whiteSpace: "pre-wrap",
    // },
  },

  padding: theme.spacing(0, 1.375, 0, 1.5),
  borderRadius: theme.shape.borderRadius,
  "&:hover": { backgroundColor: theme.palette.action.hover },

  userSelect: "auto",
}));

const Chip = styled((props: ChipProps) => <MuiChip size="small" {...props} />)({
  font: "inherit",
  minHeight: 20,
  padding: 0,
  cursor: "inherit",
});

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  paddingLeft: theme.spacing(18 / 8 + 2 + 1.5),
  paddingRight: theme.spacing(18 / 8 + 2 + 1.5),
}));

export interface ICloudLogItemProps {
  // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#FIELDS.insert_id
  data: Record<string, any>;
  chips?: string[];
}

export default function CloudLogItem({
  data: dataProp,
  chips,
}: ICloudLogItemProps) {
  const theme = useTheme();

  const data = { ...dataProp };
  if (dataProp.payload === "jsonPayload" && dataProp.jsonPayload)
    data.jsonPayload = struct.decode(dataProp.jsonPayload ?? {});

  const timestamp = new Date(
    data.timestamp.seconds * 1000 + data.timestamp.nanos / 1_000_000
  );

  const renderedChips = Array.isArray(chips)
    ? chips
        .map((key) => {
          const value = _get(data, key);
          if (!value) return null;

          return (
            <Chip
              key={key}
              label={
                typeof value === "string" || typeof value === "number"
                  ? value
                  : JSON.stringify(value)
              }
              aria-describedby={key}
            />
          );
        })
        .filter(Boolean)
    : [];

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${data.insertId}-content`}
        id={`${data.insertId}-header`}
      >
        <CloudLogSeverityIcon severity={data.severity} />

        <time dateTime={timestamp.toISOString()}>
          <Typography variant="inherit" color="text.secondary" component="span">
            {format(timestamp, DATE_FORMAT)}
          </Typography>{" "}
          <Typography variant="inherit" fontWeight="bold" component="span">
            {format(timestamp, TIME_FORMAT)}
          </Typography>
          <Typography variant="inherit" color="text.secondary" component="span">
            {format(timestamp, ":ss.SSS X")}
          </Typography>
        </time>

        {renderedChips.length > 0 && (
          <Stack direction="row" spacing={0.75}>
            {renderedChips}
          </Stack>
        )}

        <Typography variant="inherit" noWrap className="log-preview">
          {data.payload === "textPayload" && data.textPayload}
          {_get(data, "httpRequest.requestUrl")?.split(".run.app").pop()}
          {data.payload === "jsonPayload" &&
            stringify(data.jsonPayload.body ?? data.jsonPayload, {
              space: 2,
            })}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        {data.payload === "textPayload" && (
          <Typography variant="inherit" style={{ whiteSpace: "pre-wrap" }}>
            {data.textPayload}
          </Typography>
        )}
        {data.payload === "jsonPayload" && (
          <ReactJson
            src={data.jsonPayload.body ?? data.jsonPayload}
            name={data.jsonPayload.body ? "body" : "jsonPayload"}
            theme={theme.palette.mode === "dark" ? "monokai" : "rjv-default"}
            iconStyle="triangle"
            style={{ font: "inherit", backgroundColor: "transparent" }}
            displayDataTypes={false}
            quotesOnKeys={false}
            sortKeys
          />
        )}

        {data.payload && <Divider sx={{ my: 1 }} />}

        <ReactJson
          src={data}
          collapsed={!!data.payload}
          name="Full log entry"
          theme={theme.palette.mode === "dark" ? "monokai" : "rjv-default"}
          iconStyle="triangle"
          style={{ font: "inherit", backgroundColor: "transparent" }}
          displayDataTypes={false}
          quotesOnKeys={false}
          sortKeys
        />
      </AccordionDetails>
    </Accordion>
  );
}
