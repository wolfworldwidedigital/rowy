import { useState } from "react";
import { useSnackbar } from "notistack";

import Navigation from "components/Navigation";
import {
  useTheme,
  Container,
  Button,
  TextField,
  Tabs,
  Tab,
  LinearProgress,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useConfirmation } from "components/ConfirmationDialog";
import { useProjectContext } from "@src/contexts/ProjectContext";
import { RunRoutes } from "@src/constants/runRoutes";

export default function TestView() {
  const theme = useTheme();
  const { requestConfirmation } = useConfirmation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [localhost, setLocalhost] = useState(false);
  const { rowyRun } = useProjectContext();
  const [result, setResult] = useState<any>({});

  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [path, setPath] = useState<string>("/");
  const handleMethodChange = (_, newMethod) => setMethod(newMethod);
  const setDefinedRoute = (newPath) => {
    setPath(newPath.target.value);
    const _method = Object.values(RunRoutes).find(
      (r) => r.path === path
    )?.method;
    if (_method) {
      setMethod(_method);
    }
  };
  const handleRun = async () => {
    if (!rowyRun) return;
    setLoading(true);
    const resp = await rowyRun({
      route: {
        method,
        path,
      },
      localhost,
    });
    setResult(resp);
    setLoading(false);
  };
  return (
    <Navigation title="Rowy Run Sandbox">
      {loading && (
        <LinearProgress
          style={{ position: "fixed", top: 56, left: 0, right: 0 }}
        />
      )}

      <Container style={{ margin: "24px 0 200px" }}>
        <FormControlLabel
          control={
            <Switch
              size="medium"
              onClick={() => {
                setLocalhost(!localhost);
              }}
            />
          }
          label="Localhost?"
        />
        <TextField
          label="Defined Route"
          select
          value={
            Object.values(RunRoutes).find((r) => r.path === path)?.path ?? ""
          }
          onChange={setDefinedRoute}
          style={{ width: 255 }}
        >
          {Object.values(RunRoutes).map((route) => (
            <MenuItem key={route.path} value={route.path}>
              {route.path}
            </MenuItem>
          ))}
        </TextField>
        <Tabs value={method} onChange={handleMethodChange}>
          <Tab label="GET" value="GET" />
          <Tab label="POST" value="POST" />
          <Tab label="PUT" value="PUT" />
          <Tab label="DELETE" value="DELETE" />
        </Tabs>
        <TextField
          value={path}
          onChange={(value) => {
            setPath(value.target.value);
          }}
        />
        <Button onClick={handleRun}>Call</Button>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </Container>
    </Navigation>
  );
}
