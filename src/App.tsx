import { lazy, Suspense } from "react";
import { Route, Switch, Link } from "react-router-dom";

import { StyledEngineProvider } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import "./space-grotesk.css";

import CustomBrowserRouter from "utils/CustomBrowserRouter";
import PrivateRoute from "utils/PrivateRoute";
import ErrorBoundary from "components/ErrorBoundary";
import EmptyState from "components/EmptyState";
import Loading from "components/Loading";

import { SnackProvider } from "contexts/SnackContext";
import ConfirmationProvider from "components/ConfirmationDialog/Provider";
import { AppProvider } from "contexts/AppContext";
import { RowyContextProvider } from "contexts/RowyContext";
import { SnackLogProvider } from "contexts/SnackLogContext";
import routes from "constants/routes";

import AuthView from "pages/Auth";
import SignOutView from "pages/Auth/SignOut";
import TestView from "pages/Test";

import Favicon from "assets/Favicon";
import "analytics";

const AuthSetupGuidePage = lazy(
  () => import("pages/Auth/SetupGuide" /* webpackChunkName: "AuthSetupGuide" */)
);

const HomePage = lazy(
  () => import("./pages/Home" /* webpackChunkName: "HomePage" */)
);
const TablePage = lazy(
  () => import("./pages/Table" /* webpackChunkName: "TablePage" */)
);
const ImpersonatorAuthPage = lazy(
  () =>
    import(
      "./pages/Auth/ImpersonatorAuth" /* webpackChunkName: "ImpersonatorAuthPage" */
    )
);
const JwtAuthPage = lazy(
  () => import("./pages/Auth/JwtAuth" /* webpackChunkName: "JwtAuthPage" */)
);
// const GridView = lazy(
//   () => import("./views/GridView" /* webpackChunkName: "GridView" */)
// );

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ErrorBoundary>
        <AppProvider>
          <Favicon />
          <ConfirmationProvider>
            <SnackProvider>
              <SnackLogProvider>
                <CustomBrowserRouter>
                  <Suspense fallback={<Loading fullScreen />}>
                    <Switch>
                      <Route
                        exact
                        path={routes.auth}
                        render={() => <AuthView />}
                      />
                      <Route
                        exact
                        path={routes.impersonatorAuth}
                        render={() => <ImpersonatorAuthPage />}
                      />
                      <Route
                        exact
                        path={routes.authSetup}
                        render={() => <AuthSetupGuidePage />}
                      />
                      <Route
                        exact
                        path={routes.jwtAuth}
                        render={() => <JwtAuthPage />}
                      />
                      <Route
                        exact
                        path={routes.signOut}
                        render={() => <SignOutView />}
                      />
                      <Route exact path={"/test"} render={() => <TestView />} />
                      <PrivateRoute
                        exact
                        path={[
                          routes.home,
                          routes.tableWithId,
                          routes.tableGroupWithId,
                          routes.gridWithId,
                        ]}
                        render={() => (
                          <RowyContextProvider>
                            <Switch>
                              <PrivateRoute
                                exact
                                path={routes.home}
                                render={() => <HomePage />}
                              />
                              <PrivateRoute
                                path={routes.tableWithId}
                                render={() => <TablePage />}
                              />
                              <PrivateRoute
                                path={routes.tableGroupWithId}
                                render={() => <TablePage />}
                              />
                            </Switch>
                          </RowyContextProvider>
                        )}
                      />

                      <PrivateRoute
                        render={() => (
                          <EmptyState
                            message="Page Not Found"
                            description={
                              <Button
                                component={Link}
                                to={routes.home}
                                variant="outlined"
                                style={{ marginTop: 8 }}
                              >
                                Go Home
                              </Button>
                            }
                            fullScreen
                          />
                        )}
                      />
                    </Switch>
                  </Suspense>
                </CustomBrowserRouter>
              </SnackLogProvider>
            </SnackProvider>
          </ConfirmationProvider>
        </AppProvider>
      </ErrorBoundary>
    </StyledEngineProvider>
  );
}
