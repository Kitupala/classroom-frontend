export const DEPARTMENTS = ["CS", "Math", "Physics", "Chemistry", "English"];

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

export * from "./mock-data";
