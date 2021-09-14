export enum routes {
  home = "/",
  auth = "/auth",
  impersonatorAuth = "/impersonatorAuth",
  jwtAuth = "/jwtAuth",
  signOut = "/signOut",
  authSetup = "/authSetup",
  setup = "/setup",

  table = "/table",
  tableGroup = "/tableGroup",

  tableWithId = "/table/:id",
  tableGroupWithId = "/tableGroup/:id",
  grid = "/grid",
  gridWithId = "/grid/:id",
  editor = "/editor",

  settings = "/settings",
  userSettings = "/settings/user",
  projectSettings = "/settings/project",
  userManagement = "/settings/userManagement",
  rowyRunTest = "/rrTest",
}

export default routes;
