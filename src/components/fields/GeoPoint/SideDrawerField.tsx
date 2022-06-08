import { ISideDrawerFieldProps } from "@src/components/fields/types";

import { Box, Stack, TextField } from "@mui/material";
import DatePicker from "@mui/lab/DatePicker";
import DateTimeIcon from "@mui/icons-material/AccessTime";
import { fieldSx, getFieldId } from "@src/components/SideDrawer/utils";
import { GeoPoint } from "firebase/firestore";

export default function GeoPointField({
  column,
  value,
  onChange,
  onSubmit,
  disabled,
}: ISideDrawerFieldProps) {
  if (value !== undefined) {
  }
  const latitude = value?.latitude ?? null;
  const longitude = value?.longitude ?? null;

  const handleChange = (type: "latitude" | "longitude") => (e: any) => {
    const v = e.target.value;
    const updatedValue =
      type === "latitude"
        ? new GeoPoint(v ?? 0, longitude)
        : new GeoPoint(latitude, v ?? 0);
    onChange(updatedValue);
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <TextField
          label="Latitude"
          type="number"
          value={latitude}
          inputProps={{ min: -90, max: 90 }}
          onChange={handleChange("latitude")}
          disabled={disabled}
          onBlur={onSubmit}
          fullWidth
        />
        <TextField
          label="Longitude"
          type="number"
          value={longitude}
          inputProps={{ min: -180, max: 180 }}
          onChange={handleChange("longitude")}
          disabled={disabled}
          onBlur={onSubmit}
          fullWidth
        />
      </Stack>
    </>
  );
}
